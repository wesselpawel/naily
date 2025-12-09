"use client";
import { useEffect, useState } from "react";

export default function CommentsSection({ slug }: { slug: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL || ""}/api/posts/${encodeURIComponent(slug)}/comments`);
    const data = await res.json();
    setComments(Array.isArray(data) ? data : []);
  }
  useEffect(() => {
    load();
  }, [slug]);

  async function submit() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL || ""}/api/posts/${encodeURIComponent(slug)}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        }
      );
      if (res.ok) {
        setText("");
        await load();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Komentarze</h3>
      <div className="space-y-4">
        {comments.length === 0 && (
          <p className="text-sm text-neutral-600">
            Brak komentarzy. Bądź pierwszy!
          </p>
        )}
        {comments.map((c, i) => (
          <div key={i} className="border-t pt-3">
            <div className="text-sm text-neutral-800 whitespace-pre-wrap">
              {c.text}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              {new Date(c.createdAt).toLocaleString("pl-PL")}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border rounded-md p-2 text-sm"
          placeholder="Dodaj komentarz..."
          rows={3}
        />
        <button
          onClick={submit}
          disabled={loading}
          className="px-4 py-2 bg-rose-600 text-white rounded-md h-fit disabled:opacity-50"
        >
          {loading ? "Wysyłanie..." : "Wyślij"}
        </button>
      </div>
    </div>
  );
}
