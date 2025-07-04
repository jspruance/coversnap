import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { jobDescription } = await req.json();

  const prompt = `
You're an expert interview coach and senior engineer.

Using the following job description:

"""
${jobDescription}
"""

You are an expert technical interviewer. Based on the following job description, generate a realistic list of 15–20 interview questions and sample answers.

- First, include 8–10 behavioral or scenario-based questions.
- Then, include 8–10 technical questions that directly test knowledge of the specific languages, frameworks, and tools mentioned in the job description.
- The technical questions should test actual skill or understanding — not just "Tell me about a time..." style questions.
- Include frameworks like React, TypeScript, Python, or any others listed in the job description.
- For each question, provide a clear sample answer that reflects a well-prepared candidate.
- Format as: 
### Question:
<question text>
**Answer:**
<sample answer>

Keep output concise but informative.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return NextResponse.json({ result: completion.choices[0].message.content });
}
