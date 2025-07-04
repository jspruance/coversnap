"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Header from "../../components/Header";
import ReactMarkdown from "react-markdown";
import { Copy } from "lucide-react";

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
      <main className="min-h-screen bg-gradient-to-b from-white via-stone-50 to-stone-100 px-4 py-16 relative">
        <section className="flex flex-col items-center justify-center text-center z-10 relative">
          <div className="w-full max-w-6xl bg-white shadow-xl border rounded-xl p-10 space-y-10">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-stone-800 md:text-5xl">
                ✨ AI <span className="text-pink-500">Resume</span> Enhancer
              </h1>
              <p className="mt-2 text-lg text-stone-600">
                Paste your current resume below and get an improved,
                professional rewrite.
              </p>
            </div>

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your current resume here..."
              className="w-full h-60 text-base p-4 rounded-lg border border-stone-300 resize-none"
            />

            <div className="flex flex-col md:flex-row gap-4">
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

            <div className="text-center">
              <Button
                onClick={handleRewrite}
                disabled={loading}
                className="mt-4 bg-stone-900 text-white hover:bg-black cursor-pointer px-6 py-2 rounded-md"
              >
                {loading ? "Rewriting..." : "Rewrite My Resume"}
              </Button>
            </div>

            {(output || loading) && (
              <div className="relative bg-stone-50 border border-stone-200 p-8 rounded-lg shadow-sm prose prose-stone max-w-3xl mx-auto mt-6 text-left">
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
          </div>
        </section>
      </main>
    </>
  );
}
