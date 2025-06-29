"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function UnlockedPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"pending" | "success" | "error">(
    "pending"
  );

  useEffect(() => {
    const validateToken = async () => {
      try {
        const res = await fetch(`/api/unlock?token=${token}`);
        if (res.ok) {
          localStorage.setItem("coversnap_unlocked", "true");
          setStatus("success");
          setTimeout(() => router.push("/"), 3000);
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };

    if (token) {
      validateToken();
    } else {
      setStatus("error");
    }
  }, [token, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-md border">
        {status === "pending" && (
          <>
            <h1 className="text-2xl font-bold text-stone-800 mb-2">
              Validating token…
            </h1>
            <p className="text-stone-600">Please wait…</p>
          </>
        )}
        {status === "success" && (
          <>
            <h1 className="text-2xl font-bold text-stone-800 mb-2">
              You&apos;re all set!
            </h1>
            <p className="text-stone-600">
              Thank you for supporting CoverSnap. Unlimited access is now
              unlocked.
            </p>
            <p className="text-sm text-stone-500 mt-6">
              Redirecting you back to the app…
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Something went wrong
            </h1>
            <p className="text-stone-600">
              The unlock link may be invalid or expired. Please try again or
              contact support.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
