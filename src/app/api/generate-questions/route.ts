import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { jobDescription } = await req.json();

  const prompt = `
You are an expert technical interviewer. Based on the following job description, generate a realistic list of 15–20 interview questions with sample answers.

Use this job description:

"""
${jobDescription}
"""

Instructions:
- Include 8–10 behavioral or scenario-based questions.
- Include 8–10 technical questions that assess knowledge of the specific languages, frameworks, and tools mentioned in the job description.
- Avoid generic “Tell me about a time…” phrasing for technical questions. Ask questions that test skill or understanding (e.g. "What does useMemo do in React?").
- Include technologies like React, TypeScript, Python, AWS, etc., if mentioned in the job description.
- For each question, provide a realistic, well-prepared sample answer.
- Format exactly like this:

**Question:** What is your experience working with React and state management?
**Answer:** I’ve used React extensively for front-end development...

**Question:** How do you handle conflict on a remote team?
**Answer:** I believe in proactive communication...

Important:
- Do not use headings or sections.
- Do not number the questions.
- Just alternate between **Question:** and **Answer:** blocks.
- Keep each answer concise but informative, as a strong candidate might respond.

Output only the questions and answers using this structure.
`;


  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return NextResponse.json({ result: completion.choices[0].message.content });
}
