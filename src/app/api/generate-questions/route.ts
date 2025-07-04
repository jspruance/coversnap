import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { jobDescription } = await req.json();

  const prompt = `
You are an expert technical interviewer. Based on the following job description, generate 15–20 realistic interview questions and sample answers.

Use this job description:

"""
${jobDescription}
"""

Instructions:
- Include ~8 behavioral/scenario-based questions.
- Include ~8 technical questions targeting specific languages, frameworks, and tools mentioned.
- For each question:
  - Start with a line that begins with: **Question:** followed by the question.
  - Then a blank line.
  - Then a line that begins with: **Answer:** followed by the sample answer.
  - Then a blank line before the next question.
- Do NOT use bullets, numbers, or markdown headers.
- Keep formatting very clean and minimal. Only questions and answers as described.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  let raw = completion.choices[0].message.content || "";

  // ✅ Enforce clean formatting
  raw = raw
    .replace(/###\s*Question:/g, '**Question:**') // strip rogue headers
    .replace(/\*\*Question:\*\*/g, '\n\n**Question:**') // ensure newline before
    .replace(/\*\*Answer:\*\*/g, '\n\n**Answer:**') // ensure newline before
    .replace(/\n{3,}/g, '\n\n') // collapse extra spacing
    .trim();

  return NextResponse.json({ result: raw });
}
