"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Header from "../../components/Header";
import ReactMarkdown from "react-markdown";
import { Copy } from "lucide-react"; // You’re already using this in main page

export default function ResumeRewriter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tone, setTone] = useState("professional");
  const [role, setRole] = useState("");

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRewrite = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");

    const res = await fetch("/api/rewrite-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume: input,
        tone,
        role,
      }),
    });

    const data = await res.json();
    setOutput(data.result || "Something went wrong.");
    setLoading(false);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white py-20 px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-stone-800 mb-6 text-center">
          ✨ AI Resume Rewriter
        </h1>

        <p className="text-stone-600 text-center mb-8">
          Paste your current resume below and get an improved, professional
          rewrite.
        </p>

        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your current resume here..."
          className="w-full h-60 mb-4"
        />

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Target Role (e.g. Software Engineer)"
            className="flex-1 border border-stone-300 rounded px-3 py-2"
          />

          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="flex-1 border border-stone-300 rounded px-3 py-2 cursor-pointer"
          >
            <option value="professional">Professional</option>
            <option value="confident">Confident</option>
            <option value="executive">Executive</option>
            <option value="friendly">Friendly</option>
          </select>
        </div>

        <Button
          onClick={handleRewrite}
          disabled={loading}
          className="mb-8 bg-stone-900 text-white hover:bg-black cursor-pointer"
        >
          {loading ? "Rewriting..." : "Rewrite My Resume"}
        </Button>

        {(output || loading) && (
          <div className="relative bg-white border border-stone-300 p-8 rounded-xl shadow-sm prose prose-stone max-w-3xl mx-auto mt-8">
            {output ? (
              <>
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 text-sm text-stone-500 hover:text-stone-700 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? "Copied" : "Copy"}
                </button>
                <ReactMarkdown>{output}</ReactMarkdown>
              </>
            ) : (
              <p className="text-stone-500 italic">
                Your rewritten resume will appear here.
              </p>
            )}
          </div>
        )}
      </main>
    </>
  );
}
