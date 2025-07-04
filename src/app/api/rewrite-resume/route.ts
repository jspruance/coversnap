// /app/api/rewrite-resume/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { resume, tone = "professional", role = "general" } = await req.json();

  const prompt = `
You're a professional resume editor. Rewrite the resume below in a ${tone} tone, optimized for a ${role} position.

Make it clean, compelling, and free of fluff. Use action verbs, highlight accomplishments, and ensure it's ATS-friendly.
Do not include "references available on request" or similar language regarding references.
Resume:
${resume}
`;

  const response = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4o",
  });

  return NextResponse.json({ result: response.choices[0].message.content });
}
