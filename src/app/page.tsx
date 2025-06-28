"use client"

import { useState, useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Copy, Twitter, Linkedin } from "lucide-react"
import Head from "next/head"
import Image from "next/image"

export default function Home() {
  const [inputValue, setInputValue] = useState("")
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [lengthOption, setLengthOption] = useState("standard")
  const [showPaywall, setShowPaywall] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedInput = localStorage.getItem("coversnap_input")
    const savedOutput = localStorage.getItem("coversnap_output")
    if (savedInput) setInputValue(savedInput)
    if (savedOutput) setOutput(savedOutput)
  }, [])

  useEffect(() => {
    localStorage.setItem("coversnap_input", inputValue)
    localStorage.setItem("coversnap_output", output)
  }, [inputValue, output])

  useEffect(() => {
    const today = new Date().toDateString()
    const storedDate = localStorage.getItem("coversnap_date")
    if (storedDate !== today) {
      localStorage.setItem("coversnap_date", today)
      localStorage.setItem("coversnap_uses", "0")
    }
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (cooldown > 0 || loading || inputValue.trim().length < 30) return

    const unlocked = localStorage.getItem("coversnap_unlocked") === "true"
    const uses = parseInt(localStorage.getItem("coversnap_uses") || "0")
    if (!unlocked && uses >= 3) {
      setShowPaywall(true)
      return
    }

    setLoading(true)
    setOutput("")

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: inputValue.trim(), length: lengthOption })
    })

    const data = await res.json()
    setOutput(data.result || "Something went wrong.")
    setLoading(false)
    setCooldown(15)

    if (!unlocked) {
      localStorage.setItem("coversnap_uses", (uses + 1).toString())
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Head>
        <title>CoverSnap – AI-Powered Cover Letters</title>
        <meta name="description" content="Generate personalized, professional cover letters in seconds with AI. Paste the job description and get started instantly." />
        <meta property="og:title" content="CoverSnap – AI Cover Letter Generator" />
        <meta property="og:description" content="Generate personalized, professional cover letters in seconds with AI. Paste the job description and get started instantly." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CoverSnap – AI Cover Letter Generator" />
        <meta name="twitter:description" content="Generate personalized, professional cover letters in seconds with AI." />
        <meta name="twitter:image" content="/og-image.png" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "CoverSnap",
            "url": "https://coversnapapp.com",
            "description": "Generate personalized, professional cover letters in seconds with AI.",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "All"
          }
        `}</script>
        <script async defer data-domain="coversnapapp.com" src="https://plausible.io/js/plausible.js"></script>
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-white via-stone-50 to-stone-100 px-0 relative overflow-hidden">
        {/* Restored App content */}
        <section className="flex flex-col items-center justify-center text-center py-12 px-4 z-10 relative">
          <div ref={formRef} className="w-full max-w-6xl bg-white shadow-xl border rounded-xl p-10 space-y-10">
            <div className="text-center">
              <h2 className="text-5xl font-extrabold text-stone-800 tracking-tight">✍️ Apply Smarter</h2>
              <p className="text-stone-600 text-xl mt-4">Start by pasting the job description below.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-6 items-stretch">
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="jobDescription" className="text-stone-700 font-medium text-lg">Job Description:</label>
                    {inputValue && (
                      <button onClick={() => { setInputValue(""); setOutput("") }} className="text-sm text-stone-400 hover:text-stone-600 underline cursor-pointer">Start over</button>
                    )}
                  </div>
                  <div className="h-[450px] overflow-y-auto">
                    <Textarea id="jobDescription" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Paste the job description here..." className="w-full h-full text-base p-4 rounded-lg border border-stone-300 resize-none" />
                  </div>
                  <p className="text-sm text-stone-500 mt-2">💡 Works great with content pasted from LinkedIn or other job boards.</p>
                </div>

                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-stone-700 font-medium text-lg">Cover Letter:</label>
                    <select id="lengthOption" value={lengthOption} onChange={(e) => setLengthOption(e.target.value)} className="border border-stone-300 rounded-md px-2 py-1 text-sm text-stone-600 bg-white">
                      <option value="short">Short</option>
                      <option value="standard">Standard</option>
                    </select>
                  </div>

                  <div ref={resultRef} className="relative h-[450px] overflow-y-auto p-5 bg-stone-50 border border-stone-200 rounded-lg text-left shadow-sm whitespace-pre-line">
                    {output && (
                      <button type="button" onClick={handleCopy} className="absolute top-2 right-2 text-sm text-stone-500 hover:text-stone-700 flex items-center gap-1 cursor-pointer">
                        <Copy className="w-4 h-4" /> {copied ? "Copied" : "Copy"}
                      </button>
                    )}
                    <p className={`text-stone-600 ${output ? 'mt-8' : ''}`}>{output || "Your AI-generated cover letter will appear here."}</p>
                  </div>

                  <div className="mt-6 flex justify-end md:justify-end sm:justify-center">
                    <Button type="submit" onClick={handleSubmit} className="text-sm bg-stone-900 text-white hover:bg-black px-6 py-2 rounded-md cursor-pointer" disabled={loading || cooldown > 0}>
                      {loading ? "Generating..." : cooldown > 0 ? `Please wait ${cooldown}s` : "Generate Cover Letter"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </section>

        {showPaywall && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full text-center">
              <h2 className="text-lg font-semibold text-stone-800 mb-2">Free limit reached</h2>
              <p className="text-stone-600 mb-4">
                You&apos;ve used your 3 free cover letters today.
                <br />
                Unlock unlimited access for a one-time $5.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => window.location.href = "https://buy.stripe.com/3cIeVd5QIeOt1M5emQebu03"}
                  className="bg-stone-900 text-white px-4 py-2 rounded hover:bg-black"
                >
                  Unlock Now
                </button>
                <button
                  onClick={() => setShowPaywall(false)}
                  className="text-stone-500 px-4 py-2 hover:underline"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
