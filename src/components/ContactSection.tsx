"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export function ContactSection() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name ?? "");
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });

    setSending(false);
    if (!res.ok) {
      setError("Could not send your message. Please try again.");
      return;
    }
    setSent(true);
    setMessage("");
  }

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 border-t border-[#e8e8e7]">
      <div className="max-w-[480px] mx-auto text-center flex flex-col items-center gap-4">
        <span className="text-[11px] font-bold tracking-widest text-[#aaa] uppercase">Contact</span>
        <h2 className="text-[28px] sm:text-[32px] font-bold tracking-tight leading-tight">Get in touch.</h2>
        <p className="text-[15px] text-[#777] leading-relaxed">
          Questions, feedback, or an issue with an order? Send us a message and our team will get back to you.
        </p>

        {sent ? (
          <div className="w-full max-w-[420px] bg-[#f0fdf4] border border-green-200 rounded-xl px-5 py-4 text-sm text-green-700 font-medium">
            Message sent — thank you! We&apos;ll get back to you soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full max-w-[420px] flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="h-11 px-3.5 border border-[#e5e5e5] rounded-lg text-sm outline-none focus:border-[#1B4FD8] bg-white"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="h-11 px-3.5 border border-[#e5e5e5] rounded-lg text-sm outline-none focus:border-[#1B4FD8] bg-white"
              />
            </div>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we help?"
              className="px-3.5 py-3 border border-[#e5e5e5] rounded-lg text-sm outline-none resize-vertical focus:border-[#1B4FD8] bg-white"
            />
            {error && <p className="text-[13px] text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={sending}
              className="h-12 bg-[#111] text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-[#333] disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
