"use client";

import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-4">
        <Link href="/">
          <Image
            src="/logos/coversnap-logo-44h.png"
            alt="CoverSnap Logo"
            width={199}
            height={44}
          />
        </Link>

        <nav className="flex items-center gap-6 text-sm text-stone-500">
          <Link href="/" className="hover:text-stone-700">
            Cover Letter
          </Link>
          <Link href="/resume" className="hover:text-stone-700">
            Resume Enhancer
          </Link>
          <Link href="/interview" className="hover:text-stone-700">
            Interview Question Generator
          </Link>
          <Link href="/blog" className="hover:text-stone-700">
            Blog
          </Link>
          <a href="#contact" className="hover:text-stone-700">
            Contact
          </a>
          <a href="#pricing" className="hover:text-stone-700">
            Pricing
          </a>
          <a
            href="https://buy.stripe.com/00waEX5QIdKpaiB92webu04"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition"
          >
            Unlock for $5
          </a>
        </nav>
      </div>
    </header>
  );
}
