"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function InterviewQuestionGenerator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");

    const res = await fetch("/api/generate-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDescription: input }),
    });

    const data = await res.json();
    setOutput(data.result || "Something went wrong.");
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-white via-stone-50 to-stone-100 px-4 py-20">
        <section className="w-full max-w-6xl bg-white shadow-xl border rounded-xl p-10 space-y-10 mx-auto">
          <h1 className="text-4xl font-bold text-stone-800 mb-4 text-center">
            🎤 AI Interview Question Generator
          </h1>
          <p className="text-stone-600 text-center mb-8">
            Paste the job description below to generate realistic questions and
            sample answers.
          </p>

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste the job description here..."
            className="w-full h-60 mb-4"
          />

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="mb-8 bg-stone-900 text-white hover:bg-black"
          >
            {loading ? "Generating..." : "Generate Interview Questions"}
          </Button>

          {(output || loading) && (
            <div className="relative w-full bg-stone-50 border border-stone-200 p-8 rounded-xl shadow-sm prose prose-stone">
              {output
                .split(/###\s*Question:/)
                .filter(Boolean)
                .map((section, i) => {
                  const [question, ...rest] = section.split(/\*\*Answer:\*\*/);
                  const answer = rest.join("**Answer:**").trim();
                  return (
                    <div
                      key={i}
                      className="mb-6 p-4 border border-stone-200 rounded-lg bg-white shadow-sm"
                    >
                      <h3 className="font-semibold text-stone-800 mb-2">
                        Question:
                      </h3>
                      <p className="mb-4 text-stone-700">{question.trim()}</p>

                      <h4 className="font-semibold text-stone-800 mb-2">
                        Answer:
                      </h4>
                      <p className="text-stone-700">{answer}</p>
                    </div>
                  );
                })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
