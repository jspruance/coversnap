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

  // Construct dynamic prompt based on user length preference
  const lengthPrompt =
    length === "short"
      ? "Keep the cover letter concise and punchy. Just 3–4 sentences. Skip fluff and be direct."
      : "Write a professional and well-crafted cover letter tailored to the job description."

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You are an expert career coach and writer. ${lengthPrompt}`,
    },
    {
      role: "user",
      content: `Here's the job description:\n\n${input}`,
    },
  ]

  // Main LLM call
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    temperature: 0.7,
  })

  // Token usage logging
  const usage = completion.usage
  console.log(
    `Tokens used: prompt ${usage?.prompt_tokens}, completion ${usage?.completion_tokens}, total ${usage?.total_tokens}`
  )

  return NextResponse.json({ result: completion.choices[0].message.content })
}
