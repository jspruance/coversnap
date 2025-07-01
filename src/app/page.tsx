"use client";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import Head from "next/head";
import Image from "next/image";
import {
  LinkedinShareButton,
  TwitterShareButton,
  RedditShareButton,
  EmailShareButton,
  LinkedinIcon,
  TwitterIcon,
  RedditIcon,
  EmailIcon,
} from "react-share";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [resume, setResume] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [lengthOption, setLengthOption] = useState("short");
  const [toneOption, setToneOption] = useState("standard");
  const [showPaywall, setShowPaywall] = useState(false);
  const [email, setEmail] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // social media share info
  const shareUrl = "https://coversnapapp.com";
  const title = "Check out CoverSnap — AI cover letter generator";

  useEffect(() => {
    const savedInput = localStorage.getItem("coversnap_input");
    const savedOutput = localStorage.getItem("coversnap_output");
    if (savedInput) setInputValue(savedInput);
    if (savedOutput) setOutput(savedOutput);
  }, []);

  useEffect(() => {
    localStorage.setItem("coversnap_input", inputValue);
    localStorage.setItem("coversnap_output", output);
  }, [inputValue, output]);

  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem("coversnap_date");
    if (storedDate !== today) {
      localStorage.setItem("coversnap_date", today);
      localStorage.setItem("coversnap_uses", "0");
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("coversnap_resume");
    if (saved) setResume(saved);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("coversnap_resume", resume);
  }, [resume]);

  const handleClearResume = () => {
    setResume("");
    localStorage.removeItem("coversnap_resume");
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (cooldown > 0 || loading || inputValue.trim().length < 30) return;

    const unlocked = localStorage.getItem("coversnap_unlocked") === "true";
    const uses = parseInt(localStorage.getItem("coversnap_uses") || "0");
    if (!unlocked && uses >= 3) {
      setShowPaywall(true);
      return;
    }

    setLoading(true);
    setOutput("");

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: inputValue.trim(),
        resume: resume.trim(),
        length: lengthOption,
        tone: toneOption,
      }),
    });

    const data = await res.json();
    setOutput(data.result || "Something went wrong.");
    setLoading(false);
    setCooldown(15);

    if (!unlocked) {
      localStorage.setItem("coversnap_uses", (uses + 1).toString());
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/send-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      alert("Check your email for the unlock link!");
      setShowPaywall(false);
    } else {
      alert("There was a problem sending your unlock link.");
    }
  };

  const lengthDescriptions: { [key: string]: string } = {
    minimal: "Ultra-brief — ideal for informal applications.",
    short: "Quick and punchy — 3–4 tight paragraphs.",
    standard: "A balanced letter with intro, body, and closer.",
    elaborate: "Detailed and persuasive — emphasizes skills and experience.",
  };

  const toneDescriptions: { [key: string]: string } = {
    professional: "Professional tone suitable for most jobs.",
    startup: "Startup-focused, tech-savvy letter.",
    executive: "Tailored for senior roles — polished and leadership-focused.",
    creative: "More personality, suitable for design or media jobs.",
    technical: "Emphasizes hard skills and project impact.",
    funny:
      "Light-hearted and humorous — shows personality while staying professional.",
  };

  return (
    <>
      <Head>
        <title>CoverSnap – AI-Powered Cover Letters</title>
        <meta
          name="description"
          content="Generate personalized, professional cover letters in seconds with AI. Paste the job description and get started instantly."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-white via-stone-50 to-stone-100 px-0 relative overflow-hidden">
        <header className="sticky top-0 z-20 backdrop-blur bg-transparent w-full flex justify-between items-center py-4 px-4 max-w-6xl mx-auto">
          <Image
            src="/logos/coversnap-logo-44h.png"
            alt="CoverSnap Logo"
            width={199}
            height={44}
          />
          <nav className="text-stone-500 text-sm">
            <a href="#contact" className="hover:text-stone-700 cursor-pointer">
              Contact
            </a>
          </nav>
        </header>

        <section className="flex flex-col items-center justify-center text-center py-12 px-4 z-10 relative">
          <div
            ref={formRef}
            className="w-full max-w-6xl bg-white shadow-xl border rounded-xl p-10 space-y-10"
          >
            <div className="text-center">
              <h2 className="text-5xl font-extrabold text-stone-800 tracking-tight">
                ✍️ Apply Smarter
              </h2>
              <p className="text-stone-600 text-xl mt-4">
                Start by pasting the job description below.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-6 text-left"
            >
              {/* Job Description */}
              <div className="flex flex-col">
                <label
                  htmlFor="jobDescription"
                  className="text-stone-700 font-medium text-lg mb-2"
                >
                  Job Description:
                </label>
                <Textarea
                  id="jobDescription"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full h-[200px] text-base p-4 rounded-lg border border-stone-300 resize-none"
                />
                <p className="text-sm text-stone-500 mt-2">
                  💡 Works great with content pasted from LinkedIn or other job
                  boards.
                </p>
              </div>

              {/* Cover Letter Output (spans 2 rows) */}
              <div className="md:row-span-2 flex flex-col h-full">
                <div className="mb-2 flex justify-between items-center">
                  <label
                    htmlFor="style"
                    className="text-stone-700 font-medium text-lg"
                  >
                    Cover Letter:
                  </label>
                  <div>
                    <select
                      id="length"
                      className="border border-stone-300 rounded px-2 py-1 bg-white text-stone-700"
                      value={lengthOption}
                      onChange={(e) => setLengthOption(e.target.value)}
                      title={lengthDescriptions[lengthOption]}
                    >
                      <option value="minimal">Minimal</option>
                      <option value="short">Short</option>
                      <option value="standard">Standard</option>
                      <option value="elaborate">Elaborate</option>
                    </select>
                    <select
                      id="tone"
                      className="border border-stone-300 rounded ml-3 px-2 py-1 bg-white text-stone-700"
                      value={toneOption}
                      onChange={(e) => setToneOption(e.target.value)}
                      title={toneDescriptions[toneOption]}
                    >
                      <option value="professional">Professional</option>
                      <option value="startup">Startup</option>
                      <option value="executive">Executive</option>
                      <option value="technical">Technical</option>
                      <option value="creative">Creative</option>
                      <option value="funny">Funny</option>
                    </select>
                  </div>
                </div>

                <div className="relative h-full min-h-[420px] overflow-y-auto p-5 bg-stone-50 border border-stone-200 rounded-lg text-left shadow-sm whitespace-pre-line">
                  {output && (
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="absolute top-2 right-2 text-sm text-stone-500 hover:text-stone-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-4 h-4" /> {copied ? "Copied" : "Copy"}
                    </button>
                  )}
                  <p className={`text-stone-600 ${output ? "mt-8" : ""}`}>
                    {output ||
                      "Your AI-generated cover letter will appear here."}
                  </p>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    className="text-sm bg-stone-900 text-white hover:bg-black px-6 py-2 rounded-md"
                    disabled={loading || cooldown > 0}
                  >
                    {loading
                      ? "Generating..."
                      : cooldown > 0
                        ? `Please wait ${cooldown}s`
                        : "Generate Cover Letter"}
                  </Button>
                </div>
              </div>

              {/* Resume (bottom left) */}
              <div className="flex flex-col">
                <label
                  htmlFor="resume"
                  className="text-stone-700 font-medium text-lg mb-2"
                >
                  Resume (Optional):
                </label>
                {resume && (
                  <button
                    type="button"
                    onClick={handleClearResume}
                    className="text-sm text-stone-400 hover:text-stone-600 underline cursor-pointer mb-1"
                  >
                    Clear resume
                  </button>
                )}
                <Textarea
                  id="resume"
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  placeholder="Paste your resume here for a more personalized letter..."
                  className="w-full h-[200px] text-base p-4 rounded-lg border border-stone-300 resize-none"
                />
                <p className="text-sm text-stone-500 mt-2">
                  ✨ This helps the AI tailor your letter using your real
                  experience.
                </p>
              </div>
            </form>
          </div>
        </section>

        <section className="w-full bg-white text-center py-28 px-0">
          <h3 className="text-2xl font-semibold text-stone-700 mb-12">
            CoverSnap has helped candidates get jobs at:
          </h3>
          <div className="flex justify-center items-center gap-10 flex-wrap opacity-70 max-w-6xl mx-auto">
            <img
              src="/logos/google.png"
              alt="Google"
              className="h-10 grayscale"
            />
            <img
              src="/logos/microsoft.png"
              alt="Microsoft"
              className="h-10 grayscale"
            />
            <img
              src="/logos/apple.png"
              alt="Apple"
              className="h-10 grayscale"
            />
            <img
              src="/logos/nvidia.png"
              alt="Nvidia"
              className="h-10 grayscale"
            />
            <img
              src="/logos/amazon.png"
              alt="Amazon"
              className="h-10 grayscale"
            />
            <img
              src="/logos/adobe.png"
              alt="Adobe"
              className="h-10 grayscale"
            />
          </div>
        </section>

        <section className="bg-stone-100 text-center py-20 px-4">
          <h3 className="text-2xl font-bold text-stone-800 mb-2">
            🎉 Help others land their next job
          </h3>
          <p className="text-stone-600 mb-6">
            Love CoverSnap? Share it with a friend, colleague, or your followers
            — it might help someone get hired.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <TwitterShareButton url={shareUrl} title={title}>
              <TwitterIcon size={40} round />
            </TwitterShareButton>
            <LinkedinShareButton url={shareUrl}>
              <LinkedinIcon size={40} round />
            </LinkedinShareButton>
            <RedditShareButton url={shareUrl} title={title}>
              <RedditIcon size={40} round />
            </RedditShareButton>
            <EmailShareButton
              url={shareUrl}
              subject="CoverSnap"
              body={`${title} ${shareUrl}`}
            >
              <EmailIcon size={40} round />
            </EmailShareButton>
          </div>
        </section>

        <section className="bg-white py-24 px-4">
          <h3 className="text-2xl font-semibold text-center text-stone-700 mb-12">
            What people are saying
          </h3>
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[
              {
                quote:
                  "I had tailored letters out in minutes. Game-changer! ✨",
                name: "Bob Jenkins",
                location: "Phoenix, AZ",
              },
              {
                quote:
                  "My application response rate doubled after using CoverSnap. 📈",
                name: "Alicia Romero",
                location: "Austin, TX",
              },
              {
                quote: "Finally — a tool that writes like a real human. 🤖",
                name: "Mark Fields",
                location: "Chicago, IL",
              },
              {
                quote:
                  "Super clean, fast, and zero fluff. Exactly what I needed. ⚡️",
                name: "Priya Mehta",
                location: "San Francisco, CA",
              },
              {
                quote: "I stopped dreading cover letters. That’s huge. 😌",
                name: "Devon Lee",
                location: "New York, NY",
              },
              {
                quote:
                  "Got the job after using CoverSnap once. Unbelievable! 🚀",
                name: "Tina Alvarez",
                location: "Miami, FL",
              },
              {
                quote: "The tone and polish were spot on — felt like magic. ✍️",
                name: "David Kim",
                location: "Seattle, WA",
              },
              {
                quote: "Love how fast and simple it is. Total no-brainer. 🙌",
                name: "Sarah Chen",
                location: "Denver, CO",
              },
            ].map(({ quote, name, location }, i) => (
              <div
                key={i}
                className="bg-stone-50 border border-stone-200 rounded-xl shadow-sm p-6 flex flex-col justify-between"
              >
                <div className="text-yellow-400 text-sm mb-2">★★★★★</div>
                <p className="text-stone-600 italic mb-4">“{quote}”</p>
                <p className="text-sm text-stone-500">
                  — {name}, <span className="not-italic">{location}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="text-center mt-16 px-4">
          <h3 className="text-lg font-semibold text-stone-700 mb-4">
            Contact Us
          </h3>
          <form
            action="https://formspree.io/f/myzjlvwz"
            method="POST"
            className="max-w-md mx-auto space-y-4"
          >
            <input
              type="hidden"
              name="_subject"
              value="New Contact Submission from CoverSnap"
            />
            <input type="text" name="_gotcha" className="hidden" />

            <input
              type="email"
              name="email"
              required
              placeholder="Your email"
              className="w-full border border-stone-300 rounded-md p-2"
            />
            <textarea
              name="message"
              required
              placeholder="Your message"
              className="w-full border border-stone-300 rounded-md p-2 h-32"
            />
            <Button
              type="submit"
              className="bg-stone-900 text-white hover:bg-black px-6 py-2 rounded-md"
            >
              Send
            </Button>
          </form>
        </section>

        {showPaywall && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full text-center">
              <h2 className="text-lg font-semibold text-stone-800 mb-2">
                Free limit reached
              </h2>
              <p className="text-stone-600 mb-4">
                You’ve used your 3 free cover letters today.
                <br />
                Unlock unlimited access for a one-time $5.
              </p>
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() =>
                    (window.location.href =
                      "https://buy.stripe.com/00waEX5QIdKpaiB92webu04")
                  }
                  className="bg-stone-900 text-white px-4 py-2 rounded hover:bg-black cursor-pointer"
                >
                  Unlock Now ($5)
                </button>
                <p className="text-sm text-stone-500">
                  Already paid? Unlock with your email:
                </p>
                <form
                  onSubmit={handleEmailSubmit}
                  className="w-full flex flex-col items-center gap-2"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="border border-stone-300 rounded-md p-2 w-full cursor-text"
                  />
                  <Button type="submit" className="cursor-pointer">
                    Send Unlock Link
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}

        <footer className="text-center text-base text-stone-400 py-12 z-10 relative">
          &copy; CoverSnap 2025
        </footer>
      </main>
    </>
  );
}
