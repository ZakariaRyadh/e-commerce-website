"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Trash2 } from "lucide-react";

type Variant = { id?: string; size: string; color: string; stock: number };

export function AdminVariantManager({
  productId,
  productName,
  onClose,
}: {
  productId: string;
  productName: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/products/${productId}/variants`)
      .then((r) => r.json())
      .then((data: Variant[]) => {
        setVariants(data);
        setLoading(false);
      });
  }, [productId]);

  function addRow() {
    setVariants((v) => [...v, { size: "", color: "", stock: 0 }]);
  }

  function updateRow(i: number, field: keyof Variant, value: string) {
    setVariants((v) =>
      v.map((row, idx) =>
        idx === i ? { ...row, [field]: field === "stock" ? Math.max(0, parseInt(value, 10) || 0) : value } : row
      )
    );
  }

  function removeRow(i: number) {
    setVariants((v) => v.filter((_, idx) => idx !== i));
  }

  async function save() {
    setSaving(true);
    setError(null);

    const cleaned = variants.filter((v) => v.size.trim() && v.color.trim());
    if (cleaned.length === 0) {
      setError("Add at least one size/color combo.");
      setSaving(false);
      return;
    }

    const res = await fetch(`/api/admin/products/${productId}/variants`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variants: cleaned }),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Could not save stock changes");
      setSaving(false);
      return;
    }

    setSaving(false);
    router.refresh();
    onClose();
  }

  const totalStock = variants.reduce((s, v) => s + (v.stock || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/45 z-200 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-lg font-bold">Manage Stock</h2>
          <button onClick={onClose} className="text-[#aaa] hover:text-[#111] cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-[#888] mb-5">{productName}</p>

        {loading ? (
          <p className="text-sm text-[#aaa] py-8 text-center">Loading…</p>
        ) : (
          <>
            <div className="flex flex-col gap-2 mb-4">
              <div className="grid grid-cols-[1fr_1fr_100px_36px] gap-2 px-1">
                <span className="text-[11px] font-bold text-[#aaa] uppercase tracking-wider">Size</span>
                <span className="text-[11px] font-bold text-[#aaa] uppercase tracking-wider">Color</span>
                <span className="text-[11px] font-bold text-[#aaa] uppercase tracking-wider">Stock</span>
                <span />
              </div>
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_100px_36px] gap-2">
                  <input
                    value={v.size}
                    onChange={(e) => updateRow(i, "size", e.target.value)}
                    placeholder="e.g. M"
                    className="h-10 px-3 border border-[#e5e5e5] rounded-lg text-sm outline-none focus:border-[#1B4FD8]"
                  />
                  <input
                    value={v.color}
                    onChange={(e) => updateRow(i, "color", e.target.value)}
                    placeholder="e.g. Black"
                    className="h-10 px-3 border border-[#e5e5e5] rounded-lg text-sm outline-none focus:border-[#1B4FD8]"
                  />
                  <input
                    type="number"
                    min="0"
                    value={v.stock}
                    onChange={(e) => updateRow(i, "stock", e.target.value)}
                    className="h-10 px-3 border border-[#e5e5e5] rounded-lg text-sm outline-none focus:border-[#1B4FD8]"
                  />
                  <button
                    onClick={() => removeRow(i)}
                    className="h-10 w-9 flex items-center justify-center bg-red-50 text-red-600 rounded-lg cursor-pointer hover:bg-red-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addRow}
              className="h-9 px-3.5 bg-[#f5f5f4] text-[#555] rounded-lg text-[13px] font-medium cursor-pointer hover:bg-[#e5e5e4] flex items-center gap-1.5 mb-5"
            >
              <Plus size={13} /> Add size/color combo
            </button>

            <div className="flex items-center justify-between border-t border-[#f0f0f0] pt-4">
              <span className="text-sm text-[#888]">
                Total stock: <span className="font-semibold text-[#111]">{totalStock}</span>
              </span>
            </div>

            {error && <p className="text-[13px] text-red-600 mt-3">{error}</p>}

            <div className="flex gap-3 mt-5">
              <button
                onClick={onClose}
                className="flex-1 h-12 bg-[#f5f5f4] text-[#555] rounded-xl text-sm font-medium cursor-pointer hover:bg-[#e5e5e4]"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 h-12 bg-[#111] text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-[#333] disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save Stock"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
