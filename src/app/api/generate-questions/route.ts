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
  - Output exactly one line that begins with **Question:**
  - Followed by a blank line
  - Then exactly one line that begins with **Answer:**
  - Then a blank line before the next question

Example:

**Question:** What is your experience working with React and state management?

**Answer:** I’ve used React extensively for front-end development...

**Question:** How do you debug a Node.js application?

**Answer:** I start by replicating the issue...

Important:
- Do not combine questions and answers.
- Separate each Q&A clearly using line breaks as shown.
- Do not use headers, bullets, or numbers.
`;



  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return NextResponse.json({ result: completion.choices[0].message.content });
}
