// app/blog/page.tsx

import Link from "next/link";
import { blogPosts } from "./posts";

export default function BlogIndexPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>

      <ul className="space-y-10">
        {blogPosts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`}>
              <h2 className="text-2xl font-semibold text-pink-600 hover:underline">
                {post.title}
              </h2>
            </Link>
            <p className="text-sm text-gray-500 mt-1">{post.date}</p>
            <p className="text-base text-gray-700 mt-2">{post.description}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
