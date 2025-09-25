// app/api/generate/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { APIError } from "openai/error";

//  Disable Next.js caching for this API route
// `dynamic = "force-dynamic"` → always render fresh on each request (no pre-rendering)
// `revalidate = 0` → don't reuse cached results (no ISR)
export const dynamic = "force-dynamic";
export const revalidate = 0;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Server misconfig: missing OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const jobDescription = (body?.jobDescription ?? "").toString().slice(0, 4000);
  const length = (body?.length ?? "standard").toString().slice(0, 20);
  const tone = (body?.tone ?? "professional").toString().slice(0, 30);
  const resume = (body?.resume ?? "").toString().slice(0, 6000);

  if (!jobDescription) {
    return NextResponse.json(
      { error: "Field 'job description') is required" },
      { status: 400 }
    );
  }

  // NOTE: Skip in-memory rate limiting in Part 1 (not reliable on serverless).
  // Mention you'll add a proper limiter (e.g., Upstash/Redis) in a later video.

  // Length-based instructions
  let lengthInstruction = "";
  switch (length) {
    case "short":
      lengthInstruction =
        "Keep the cover letter concise and punchy. Just 3–4 sentences. Skip fluff and be direct.";
      break;
    case "minimal":
      lengthInstruction =
        "Write a minimalist, efficient letter with 2–3 sentences and no filler.";
      break;
    case "elaborate":
      lengthInstruction =
        "Write a detailed, persuasive letter emphasizing accomplishments and relevant experience.";
      break;
    case "standard":
    default:
      lengthInstruction =
        "Write a professional and well-crafted cover letter tailored to the job description.";
      break;
  }

  // Tone-based instructions
  let toneInstruction = "";
  switch (tone) {
    case "startup":
      toneInstruction =
        "Write a startup-oriented cover letter, at most 2–3 tight paragraphs. Use tech-savvy, Silicon Valley startup lingo. No address or placeholders at the top.";
      break;
    case "executive":
      toneInstruction =
        "Craft a polished, executive-leadership-oriented letter tailored for senior-level positions.";
      break;
    case "creative":
      toneInstruction =
        "Write a creative, personality-driven letter appropriate for design or media jobs.";
      break;
    case "technical":
      toneInstruction =
        "Write a technically focused letter highlighting hard skills, projects, and tools.";
      break;
    case "funny":
      toneInstruction =
        "Write a funny cover letter. 1–2 paragraphs at most. No address or placeholders at the top.";
      break;
    case "professional":
    default:
      // "professional" or no tone just means neutral — no override
      break;
  }

  const styleInstruction = `${lengthInstruction} ${toneInstruction}`.trim();

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        `You are an expert cover-letter writer. ` +
        `Write a concise, tailored letter with greeting, 1–2 short paragraphs, and a closing. ` +
        `${styleInstruction}`,
    },
    {
      role: "user",
      content: `Here's the job description:\n\n${jobDescription}`,
    },
  ];

  if (resume && resume.length > 20) {
    messages.push({
      role: "user",
      content:
        `Use my resume to tailor the letter. Emphasize the best matches to the role. ` +
        `Do not copy the resume verbatim—rephrase naturally.\n\nResume:\n${resume}`,
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // viewers can swap to gpt-5 if they have access
      messages,
      temperature: 0.7,
      // max_tokens: 600, // optional safety bound
    });

    const text = completion.choices?.[0]?.message?.content ?? "";
    const usage = completion.usage;
    console.log(
      `Tokens used: prompt ${usage?.prompt_tokens}, completion ${usage?.completion_tokens}, total ${usage?.total_tokens}`
    );

    return NextResponse.json(
      { text },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    if (err instanceof APIError) {
      console.error("LLM error:", err.status, err.message);
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Unknown server error" },
      { status: 500 }
    );
  }
}
