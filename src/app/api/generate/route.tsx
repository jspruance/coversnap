// File: app/api/generate/route.ts
import { NextResponse } from "next/server"
import OpenAI from "openai"
import { ChatCompletionMessageParam } from "openai/resources/chat/completions"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Simple in-memory rate limiter
const ipRequests: Record<string, { count: number; lastRequest: number }> = {}
const RATE_LIMIT = 10 // max 10 requests per hour

export async function POST(req: Request) {
  const { input, length } = await req.json()

  const ip = req.headers.get("x-forwarded-for") || "unknown"
  const now = Date.now()

  if (!ipRequests[ip]) {
    ipRequests[ip] = { count: 1, lastRequest: now }
  } else {
    const elapsed = now - ipRequests[ip].lastRequest
    if (elapsed > 60 * 60 * 1000) {
      ipRequests[ip] = { count: 1, lastRequest: now }
    } else {
      ipRequests[ip].count++
      if (ipRequests[ip].count > RATE_LIMIT) {
        return NextResponse.json(
          { result: "Rate limit exceeded. Try again later." },
          { status: 429 }
        )
      }
    }
  }

  const prompts: { [key: string]: string } = {
    short: "Write a short, punchy cover letter (3–4 tight paragraphs) for the following job:\n\n",
    standard: "Write a balanced cover letter with intro, body, and closing for the following job:\n\n",
    concise: "Write a concise, no-filler cover letter (2–3 strong paragraphs) for the following job:\n\n",
    elaborate: "Write a detailed, persuasive cover letter emphasizing skills and experience for the following job:\n\n",
    executive: "Write a polished, leadership-focused cover letter suitable for an executive role:\n\n",
    creative: "Write a creative, personality-driven cover letter for a design or media position:\n\n",
    technical: "Write a technically detailed cover letter highlighting hard skills and project outcomes:\n\n"
  }

  const prompt = prompts[length] || prompts["standard"]

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: "You are an expert career coach and professional writer. Follow best practices for tone, clarity, and structure.",
    },
    {
      role: "user",
      content: prompt + input,
    },
  ]

  // main LLM call
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    temperature: 0.7,
  })

  const usage = completion.usage
  console.log(
    `Tokens used: prompt ${usage?.prompt_tokens}, completion ${usage?.completion_tokens}, total ${usage?.total_tokens}`
  )

  return NextResponse.json({ result: completion.choices[0].message.content })
}
