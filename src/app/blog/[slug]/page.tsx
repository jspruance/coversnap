// app/blog/[slug]/page.tsx

import { blogPosts } from "../posts";
import { notFound } from "next/navigation";

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) return notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-6">{post.date}</p>
      <div
        className="prose prose-stone max-w-none"
        dangerouslySetInnerHTML={{ __html: convertMarkdown(post.content) }}
      />
    </main>
  );
}

// Helper function to render markdown (for now, just naive conversion)
function convertMarkdown(markdown: string) {
  // You can install and use `marked`, `remark`, or `markdown-it` for better parsing
  return markdown
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<em>$1</em>")
    .replace(/\n$/gim, "<br />");
}
