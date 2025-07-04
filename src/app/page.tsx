"use client";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import Head from "next/head";
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
import Header from "@/components/Header";

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

  useEffect(() => {
    if (output && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [output]);

  const handleClearResume = () => {
    setResume("");
    localStorage.removeItem("coversnap_resume");
  };

  const handleReset = () => {
    setInputValue("");
    setResume("");
    setOutput("");
    setCooldown(0);
    setShowPaywall(false);
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
        <title>CoverSnap | AI Cover Letter Generator – Free & Instant</title>
        <meta
          name="description"
          content="Generate personalized, professional cover letters in seconds using AI. No signup needed – just paste the job description and go."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Open Graph for Facebook/LinkedIn */}
        <meta
          property="og:title"
          content="CoverSnap | AI Cover Letter Generator"
        />
        <meta
          property="og:description"
          content="Generate personalized cover letters instantly with AI. Free to try – no signup required."
        />
        <meta
          property="og:image"
          content="https://coversnapapp.com/og-image.png"
        />
        <meta property="og:url" content="https://coversnapapp.com/" />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="CoverSnap | AI Cover Letter Generator"
        />
        <meta
          name="twitter:description"
          content="Create AI-powered cover letters in seconds. Free, fast, and no login needed."
        />
        <meta
          name="twitter:image"
          content="https://coversnapapp.com/og-image.png"
        />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-white via-stone-50 to-stone-100 px-0 relative overflow-hidden">
        <Header />

        <section className="flex flex-col items-center justify-center text-center py-12 px-4 z-10 relative">
          <div className="w-full max-w-6xl bg-white shadow-xl border rounded-xl p-10 space-y-10">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-stone-800 md:text-5xl">
                ✍️ AI <span className="text-pink-500">Cover Letter</span>{" "}
                Generator
              </h1>
              <p className="mt-2 text-lg text-stone-600">
                Instantly generate tailored cover letters from any job
                description.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              {/* Job Description */}
              <div>
                <label
                  htmlFor="jobDescription"
                  className="text-stone-700 font-medium text-lg mb-2 block"
                >
                  Job Description:
                </label>
                <Textarea
                  id="jobDescription"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full h-[180px] text-base p-4 rounded-lg border border-stone-300 resize-none"
                />
                <p className="text-sm text-stone-500 mt-2">
                  💡 Works great with content pasted from LinkedIn or other job
                  boards.
                </p>
              </div>

              {/* Resume Input */}
              <div>
                <label
                  htmlFor="resume"
                  className="text-stone-700 font-medium text-lg mb-2 block"
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
                  className="w-full h-[180px] text-base p-4 rounded-lg border border-stone-300 resize-none"
                />
                <p className="text-sm text-stone-500 mt-2">
                  ✨ This helps the AI tailor your letter using your real
                  experience.
                </p>
              </div>

              {/* Tone and Length Options */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label
                    htmlFor="tone"
                    className="block text-stone-700 font-medium mb-1"
                  >
                    Tone:
                  </label>
                  <select
                    id="tone"
                    className="w-full border border-stone-300 rounded px-3 py-2 bg-white text-stone-700"
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

                <div className="flex-1">
                  <label
                    htmlFor="length"
                    className="block text-stone-700 font-medium mb-1"
                  >
                    Length:
                  </label>
                  <select
                    id="length"
                    className="w-full border border-stone-300 rounded px-3 py-2 bg-white text-stone-700"
                    value={lengthOption}
                    onChange={(e) => setLengthOption(e.target.value)}
                    title={lengthDescriptions[lengthOption]}
                  >
                    <option value="minimal">Minimal</option>
                    <option value="short">Short</option>
                    <option value="standard">Standard</option>
                    <option value="elaborate">Elaborate</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-center">
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  className="bg-stone-900 text-white hover:bg-black px-6 py-2 rounded-md cursor-pointer"
                  disabled={loading || cooldown > 0}
                >
                  {loading
                    ? "Generating..."
                    : cooldown > 0
                      ? `Please wait ${cooldown}s`
                      : "Generate Cover Letter"}
                </Button>
              </div>

              {/* Output Panel */}
              <div className="relative bg-stone-50 border border-stone-200 p-5 rounded-lg shadow-sm whitespace-pre-line min-h-[240px]">
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
                  {output || "Your AI-generated cover letter will appear here."}
                </p>
              </div>
              {output && (
                <button
                  onClick={handleReset}
                  className="text-sm text-pink-600 hover:underline mt-4 cursor-pointer"
                >
                  Start over
                </button>
              )}
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

        <section className="bg-white  py-20 px-4">
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
        <section
          id="pricing"
          className="bg-white border-t py-24 px-4 text-center"
        >
          <div id="pricing" className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-stone-800">
              Simple, Fair Pricing
            </h2>
            <p className="text-stone-600 mb-6">
              Get unlimited lifetime access for a one-time payment.
            </p>
            <div className="inline-block border rounded-xl shadow-sm p-6 bg-pink-50">
              <div className="text-4xl font-extrabold text-pink-600 mb-2">
                $5
              </div>
              <p className="text-stone-700 mb-4">Lifetime unlock</p>
              <ul className="text-sm text-stone-600 space-y-2 text-left">
                <li>✅ Unlimited cover letters</li>
                <li>✅ Resume-based personalization</li>
                <li>✅ Future features included</li>
              </ul>
            </div>
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
