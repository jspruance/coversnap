"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function UnlockedPage() {
  const router = useRouter()

  useEffect(() => {
    localStorage.setItem("coversnap_unlocked", "true")
    router.push("/") // redirect to main page
  }, [router])

  return <p className="p-10 text-center">Thanks for supporting us! Redirecting...</p>
}
