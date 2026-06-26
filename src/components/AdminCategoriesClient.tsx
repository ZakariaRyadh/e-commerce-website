"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

type Category = { id: string; name: string; slug: string; productCount: number };

export function AdminCategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    setCategories(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError(null);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Could not create category");
    } else {
      setNewName("");
    }
    setAdding(false);
    load();
  }

  function startEdit(c: Category) {
    setEditingId(c.id);
    setEditName(c.name);
    setError(null);
  }

  async function saveEdit(id: string) {
    setError(null);
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Could not rename category");
      return;
    }
    setEditingId(null);
    load();
  }

  async function remove(c: Category) {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    setError(null);
    const res = await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Could not delete category");
      return;
    }
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Categories</h1>

      <form onSubmit={handleAdd} className="flex gap-2 max-w-md">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name…"
          className="flex-1 h-10 px-3.5 border border-[#e5e5e5] rounded-lg text-sm outline-none focus:border-[#1B4FD8] bg-white"
        />
        <button
          type="submit"
          disabled={adding || !newName.trim()}
          className="h-10 px-4 bg-[#111] text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-[#333] disabled:opacity-50 flex items-center gap-1.5"
        >
          <Plus size={14} /> Add
        </button>
      </form>

      {error && <p className="text-[13px] text-red-600">{error}</p>}

      <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden max-w-xl">
        <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[420px]">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
              <th className="px-5 py-2.5 text-left text-[11px] font-bold text-[#aaa] uppercase tracking-wider">Name</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold text-[#aaa] uppercase tracking-wider">Products</th>
              <th className="px-5 py-2.5 text-right text-[11px] font-bold text-[#aaa] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-[#f5f5f5] hover:bg-[#fafafa]">
                <td className="px-5 py-3 text-sm font-medium">
                  {editingId === c.id ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 px-2.5 border border-[#e5e5e5] rounded-md text-sm outline-none focus:border-[#1B4FD8]"
                    />
                  ) : (
                    c.name
                  )}
                </td>
                <td className="px-5 py-3 text-[13px] text-[#555]">{c.productCount}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex gap-1.5 justify-end">
                    {editingId === c.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(c.id)}
                          className="h-8 w-8 flex items-center justify-center bg-green-50 text-green-700 rounded-md cursor-pointer hover:bg-green-100"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="h-8 w-8 flex items-center justify-center bg-[#f5f5f4] text-[#555] rounded-md cursor-pointer hover:bg-[#e5e5e4]"
                        >
                          <X size={13} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(c)}
                          className="h-8 px-3 bg-[#f5f5f4] text-[#555] rounded-md text-xs font-medium cursor-pointer hover:bg-[#e5e5e4] hover:text-[#111] flex items-center gap-1"
                        >
                          <Pencil size={12} /> Rename
                        </button>
                        <button
                          onClick={() => remove(c)}
                          className="h-8 px-3 bg-red-50 text-red-600 rounded-md text-xs font-medium cursor-pointer hover:bg-red-100 flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && categories.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-[#aaa]">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
