import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Simple in-memory rate limiter
const ipRequests: Record<string, { count: number; lastRequest: number }> = {};
const RATE_LIMIT = 10; // max 10 requests per hour

export async function POST(req: Request) {
  const { input, length, tone, resume } = await req.json();

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();

  if (!ipRequests[ip]) {
    ipRequests[ip] = { count: 1, lastRequest: now };
  } else {
    const elapsed = now - ipRequests[ip].lastRequest;
    if (elapsed > 60 * 60 * 1000) {
      ipRequests[ip] = { count: 1, lastRequest: now };
    } else {
      ipRequests[ip].count++;
      if (ipRequests[ip].count > RATE_LIMIT) {
        return NextResponse.json(
          { result: "Rate limit exceeded. Try again later." },
          { status: 429 }
        );
      }
    }
  }

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

  // Tone-based instructions (if any)
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
      content: `You are an expert cover letter writer. ${styleInstruction}`,
    },
    {
      role: "user",
      content: `Here's the job description:\n\n${input}`,
    },
  ];

  // If resume was provided, add it as an additional message
  if (resume && resume.length > 20) {
    messages.push({
      role: "user",
      content: `
Here is my resume. Use this to tailor the cover letter to highlight relevant experience, skills, and achievements that match the job description. Emphasize strong fits between my background and the role. Do not copy the resume verbatim — instead, rephrase it naturally within the cover letter.

Resume:
${resume}`.trim(),
    });
  }

  if (resume?.length) {
    console.log(`Resume included: ${resume.length} characters`);
  }

  // main LLM request
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    temperature: 0.7,
  });

  const usage = completion.usage;
  console.log(
    `Tokens used: prompt ${usage?.prompt_tokens}, completion ${usage?.completion_tokens}, total ${usage?.total_tokens}`
  );

  return NextResponse.json({ result: completion.choices[0].message.content });
}
