// app/api/generate/route.ts
import { NextResponse } from "next/server";
import OpenAI, { APIError } from "openai";

// Disable Next.js caching for this API route
export const dynamic = "force-dynamic";
export const revalidate = 0;
// If you want to force Node runtime (recommended for server SDKs):
export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Simple in-memory rate limiter
const ipRequests: Record<string, { count: number; lastRequest: number }> = {};
const RATE_LIMIT = 10; // max 10 requests per hour

// Define a type for your incoming request body
interface RequestBody {
  jobDescription: string;
  length?: "short" | "minimal" | "elaborate" | "standard";
  tone?: "startup" | "executive" | "creative" | "technical" | "funny" | "professional";
  resume?: string;
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Server misconfig: missing OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const jobDescription = body.jobDescription?.toString().slice(0, 4000) ?? "";
  const length = body.length ?? "standard";
  const tone = body.tone ?? "professional";
  const resume = body.resume?.toString().slice(0, 6000) ?? "";

  if (!jobDescription) {
    return NextResponse.json(
      { error: "Field 'jobDescription' is required" },
      { status: 400 }
    );
  }

  // ---- Rate limiting block ----
  const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
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
          { error: "Rate limit exceeded. Try again later." },
          { status: 429 }
        );
      }
    }
  }
  // ------------------------------

  /*
    INSTRUCTIONS START
  */
  // Length-based instructions
  let lengthInstruction = "";
  switch (length) {
    case "short":
      lengthInstruction = "Keep the cover letter concise and punchy. Just 3–4 sentences. Skip fluff and be direct.";
      break;
    case "minimal":
      lengthInstruction = "Write a minimalist, efficient letter with 2–3 sentences and no filler.";
      break;
    case "elaborate":
      lengthInstruction = "Write a detailed, persuasive letter emphasizing accomplishments and relevant experience.";
      break;
    case "standard":
    default:
      lengthInstruction = "Write a professional and well-crafted cover letter tailored to the job description.";
      break;
  }

  // Tone-based instructions
  let toneInstruction = "";
  switch (tone) {
    case "startup":
      toneInstruction = "Write a startup-oriented cover letter, at most 2–3 tight paragraphs. Use tech-savvy, Silicon Valley startup lingo. No address or placeholders at the top.";
      break;
    case "executive":
      toneInstruction = "Craft a polished, executive-leadership-oriented letter tailored for senior-level positions.";
      break;
    case "creative":
      toneInstruction = "Write a creative, personality-driven letter appropriate for design or media jobs.";
      break;
    case "technical":
      toneInstruction = "Write a technically focused letter highlighting hard skills, projects, and tools.";
      break;
    case "funny":
      toneInstruction = "Write a funny cover letter. 1–2 paragraphs at most. No address or placeholders at the top.";
      break;
    case "professional":
    default:
      break;
  }

  const styleInstruction = `${lengthInstruction} ${toneInstruction}`.trim();

  // Derive arg type from SDK
  type CreateArgs = Parameters<typeof openai.responses.create>[0];

  // Build block-structured input
  const input: Exclude<CreateArgs["input"], string> = [
    {
      role: "developer",
      content: [
        {
          type: "input_text",
          text: `You are an expert cover letter writer. ${styleInstruction}\nReturn only the final cover letter text.`,
        },
      ],
    },
    {
      role: "user",
      content: [{ type: "input_text", text: `Job Description:\n\n${jobDescription}` }],
    },
  ];

  if (resume && resume.length > 20) {
    input.push({
      role: "user",
      content: [{ type: "input_text", text: `Resume (use to tailor, do not copy verbatim):\n${resume}` }],
    });
  }

  if (resume?.length) {
    console.log(`Resume included: ${resume.length} characters`);
  }
  /*
    INSTRUCTIONS END
  */

  try {
    const response = await openai.responses.create({
      model: "gpt-4o", // or "gpt-5" if available
      instructions: "Follow the style. Return only the final cover letter text.",
      input,
      temperature: 0.7,
    });

    const text = response.output_text ?? "";
    const usage = response.usage;

    if (usage) {
      console.log(
        `Tokens used: input ${usage.input_tokens}, output ${usage.output_tokens}, total ${usage.total_tokens}`
      );
    }

    return NextResponse.json({ text }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (err instanceof APIError) {
      console.error("LLM error:", err.status, err.message);
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Unknown server error" }, { status: 500 });
  }
}
