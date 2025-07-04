// app/interview/page.tsx
"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import ReactMarkdown from "react-markdown";
import { Copy } from "lucide-react";

export default function InterviewQuestionGenerator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resume, setResume] = useState("");

  const [role, setRole] = useState("");

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    if (!role.trim()) return;
    setLoading(true);
    setOutput("");

    const res = await fetch("/api/generate-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, input }),
    });

    const data = await res.json();
    setOutput(data.result || "Something went wrong.");
    setLoading(false);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white py-20 px-4">
        <section className="bg-white rounded-xl shadow-sm p-8 max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-stone-800 mb-3 text-center">
            🎯 <span className="text-black">AI</span>{" "}
            <span className="text-pink-500">Interview Question</span>{" "}
            <span className="text-black">Generator</span>
          </h1>
          <p className="text-stone-600 text-center mb-10">
            Get tailored interview questions based on your resume and role.
          </p>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Target Role (e.g. Frontend Engineer)"
              className="flex-1 border border-stone-300 rounded px-3 py-2"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <textarea
              placeholder="Paste your resume here (optional)..."
              className="flex-1 border border-stone-300 rounded px-3 py-2 h-32"
              value={resume}
              onChange={(e) => setResume(e.target.value)}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-stone-900 text-white hover:bg-black"
          >
            {loading ? "Generating..." : "Generate Questions"}
          </Button>

          {output && (
            <div className="mt-10 bg-white border border-stone-300 p-6 rounded-xl prose prose-stone max-w-3xl mx-auto">
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
