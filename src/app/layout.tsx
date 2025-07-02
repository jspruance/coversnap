import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CoverSnap | AI Cover Letter Generator – Free & Instant",
  description:
    "Generate personalized, professional cover letters in seconds using AI. No signup needed – just paste the job description and go.",
  openGraph: {
    title: "CoverSnap | AI Cover Letter Generator",
    description:
      "Generate personalized cover letters instantly with AI. Free to try – no signup required.",
    url: "https://coversnapapp.com",
    type: "website",
    images: [
      {
        url: "https://coversnapapp.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "CoverSnap – AI Cover Letter Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CoverSnap | AI Cover Letter Generator",
    description:
      "Create AI-powered cover letters in seconds. Free, fast, and no login needed.",
    images: ["https://coversnapapp.com/og-image.png"],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
      <Analytics />
    </html>
  );
}
