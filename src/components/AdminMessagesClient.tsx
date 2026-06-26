"use client";

import { useEffect, useState } from "react";
import { Mail, MailOpen, CheckCircle2, Trash2 } from "lucide-react";

type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: "NEW" | "READ" | "RESOLVED";
  createdAt: string;
};

const STATUS_META: Record<string, { color: string; bg: string; label: string }> = {
  NEW: { color: "#1B4FD8", bg: "#eff6ff", label: "New" },
  READ: { color: "#d97706", bg: "#fffbeb", label: "Read" },
  RESOLVED: { color: "#16a34a", bg: "#f0fdf4", label: "Resolved" },
};

export function AdminMessagesClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/messages");
    setMessages(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: Message["status"]) {
    setBusyId(id);
    await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusyId(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    setBusyId(id);
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    setBusyId(null);
    load();
  }

  const newCount = messages.filter((m) => m.status === "NEW").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        {newCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-[#1B4FD8] text-white text-xs font-semibold">{newCount} new</span>
        )}
      </div>

      {!loading && messages.length === 0 && (
        <div className="bg-white border border-[#e5e5e5] rounded-xl py-16 text-center text-sm text-[#aaa]">
          No messages yet.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {messages.map((m) => {
          const meta = STATUS_META[m.status];
          return (
            <div key={m.id} className="bg-white border border-[#e5e5e5] rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-2.5">
                <div>
                  <div className="text-sm font-semibold">{m.name}</div>
                  <div className="text-xs text-[#aaa]">{m.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {meta.label}
                  </span>
                  <span className="text-xs text-[#aaa]">{new Date(m.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <p className="text-sm text-[#444] leading-relaxed mb-3.5">{m.message}</p>
              <div className="flex gap-2">
                {m.status !== "READ" && m.status !== "RESOLVED" && (
                  <button
                    disabled={busyId === m.id}
                    onClick={() => setStatus(m.id, "READ")}
                    className="h-8 px-3 bg-[#f5f5f4] text-[#555] rounded-md text-xs font-medium cursor-pointer hover:bg-[#e5e5e4] flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <MailOpen size={12} /> Mark Read
                  </button>
                )}
                {m.status !== "RESOLVED" && (
                  <button
                    disabled={busyId === m.id}
                    onClick={() => setStatus(m.id, "RESOLVED")}
                    className="h-8 px-3 bg-green-50 text-green-700 rounded-md text-xs font-medium cursor-pointer hover:bg-green-100 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 size={12} /> Resolve
                  </button>
                )}
                <a
                  href={`mailto:${m.email}`}
                  className="h-8 px-3 bg-[#eff6ff] text-[#1B4FD8] rounded-md text-xs font-medium hover:bg-[#dbeafe] flex items-center gap-1.5"
                >
                  <Mail size={12} /> Reply by Email
                </a>
                <button
                  disabled={busyId === m.id}
                  onClick={() => remove(m.id)}
                  className="h-8 px-3 bg-red-50 text-red-600 rounded-md text-xs font-medium cursor-pointer hover:bg-red-100 flex items-center gap-1.5 disabled:opacity-50 ml-auto"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
