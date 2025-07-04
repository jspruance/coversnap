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
- Generate 8–10 behavioral or scenario-based questions.
- Generate 8–10 technical questions targeting specific frameworks, languages, and tools mentioned.
- For each question:
  - Start with a line that begins with: **Question:** followed by the question
  - Add one empty line
  - Then a line that begins with: **Answer:** followed by the sample answer
  - Add one empty line **before starting the next question**
- Do NOT combine multiple Q&As into one paragraph.
- Do NOT number or group questions.
- Ensure there is exactly one blank line between each Q&A pair.

Example format:

**Question:** What is your experience with React and state management?

**Answer:** I’ve used React extensively...

**Question:** How do you debug a Node.js application?

**Answer:** I usually start by...

Only output questions and answers in this format. No extra commentary.
`;





  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return NextResponse.json({ result: completion.choices[0].message.content });
}
