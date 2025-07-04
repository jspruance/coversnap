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
  - Start with a line that begins with: **Question:** followed by the question.
  - Then a blank line.
  - Then a line that begins with: **Answer:** followed by the sample answer.
  - Then a blank line before the next question.
- DO NOT combine questions and answers in one paragraph.
- DO NOT include extra formatting like numbers, bullets, or headers.
- DO NOT prepend questions with “###” or any markdown heading.
- Maintain clear spacing and structure for each Q&A block.

Example:

**Question:** How do you approach debugging a Node.js application?

**Answer:** I begin by replicating the issue locally using...

Only output questions and answers in this format. No extra commentary.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  let raw = completion.choices[0].message.content || "";

  // ✅ Post-process: Ensure consistent spacing
  raw = raw
    .replace(/\*\*Question:\*\*/g, "### Question:")
    .replace(/\*\*Answer:\*\*/g, "**Answer:**")
    .replace(/\n{2,}/g, "\n\n") // Collapse excessive newlines
    .trim();

  return NextResponse.json({ result: raw });
}
