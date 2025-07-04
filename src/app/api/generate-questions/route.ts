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

Generate 10 to 20 tailored interview questions AND sample answers.

Include:
- A mix of general/behavioral questions
- Technical questions targetentioned in the JD
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
