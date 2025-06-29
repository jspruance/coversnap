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

  // Map each length/style option to specific prompt behavior
  let styleInstruction: string
  switch (length) {
    case "short":
      styleInstruction = "Keep the cover letter concise and punchy. Just 3–4 sentences. Skip fluff and be direct."
      break
    case "concise":
      styleInstruction = "Write a minimalist, efficient letter with 2–3 sentences and no filler."
      break
    case "elaborate":
      styleInstruction = "Write a detailed, persuasive letter emphasizing accomplishments and relevant experience."
      break
    case "startup":
      styleInstruction = "Write a startup-oriented cover letter, at most 2-3 tight paragraphs. Use tech-savvy, Silicon valley startup lingo. No address or placeholders at the top." 
      break
    case "executive":
      styleInstruction = "Craft a polished, executive-leadership-oriented letter tailored for senior-level positions."
      break
    case "creative":
      styleInstruction = "Write a creative, personality-driven letter appropriate for design or media jobs."
      break
    case "technical":
      styleInstruction = "Write a technically focused letter highlighting hard skills, projects, and tools."
      break
    case "funny":
      styleInstruction = "Write a funny cover letter. 1-2 paragraphes at most. No address or placeholders at the top." 
      break
    case "standard":
    default:
      styleInstruction = "Write a professional and well-crafted cover letter tailored to the job description."
      break
  }

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You are an expert cover letter writer. ${styleInstruction}`
    },
    {
      role: "user",
      content: `Here's the job description:\n\n${input}`
    }
  ]

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    temperature: 0.7
  })

  const usage = completion.usage
  console.log(
    `Tokens used: prompt ${usage?.prompt_tokens}, completion ${usage?.completion_tokens}, total ${usage?.total_tokens}`
  )

  return NextResponse.json({ result: completion.choices[0].message.content })
}
