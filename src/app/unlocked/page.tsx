"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function UnlockedPage() {
  const router = useRouter()

  useEffect(() => {
    localStorage.setItem("coversnap_unlocked", "true")

    const timeout = setTimeout(() => {
      router.push("/")
    }, 3000)

    return () => clearTimeout(timeout)
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-md border">
        <h1 className="text-2xl font-bold text-stone-800 mb-2">You're all set!</h1>
        <p className="text-stone-600">
          Thank you for supporting CoverSnap. Unlimited access is now unlocked.
        </p>
        <p className="text-sm text-stone-500 mt-6">Redirecting you back to the app...</p>
      </div>
    </main>
  )
}

