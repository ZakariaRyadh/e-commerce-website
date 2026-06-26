"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Upload, Boxes, ImageIcon } from "lucide-react";
import { money, stockMeta } from "@/lib/format";
import { AdminVariantManager } from "@/components/AdminVariantManager";
import { AdminImageManager } from "@/components/AdminImageManager";

type Product = {
  id: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  description: string;
  categoryId: string;
  material: string | null;
  fit: string | null;
  care: string | null;
  origin: string | null;
  totalStock: number;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "SOLD_OUT";
  variantCount: number;
  category: string;
  imgUrl: string;
};

type Category = { id: string; name: string };

const emptyForm = {
  name: "",
  price: "",
  compareAtPrice: "",
  categoryId: "",
  description: "",
  stock: "10",
  material: "",
  fit: "",
  care: "",
  origin: "",
};

export function AdminProductsClient({
  initialProducts,
  categories,
}: {
  initialProducts: Product[];
  categories: Category[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [managingStockFor, setManagingStockFor] = useState<Product | null>(null);
  const [managingImagesFor, setManagingImagesFor] = useState<Product | null>(null);

  const filtered = initialProducts.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  function openAdd() {
    setEditingId(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id ?? "" });
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      price: String(p.price),
      compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : "",
      categoryId: p.categoryId,
      description: p.description,
      stock: "10",
      material: p.material ?? "",
      fit: p.fit ?? "",
      care: p.care ?? "",
      origin: p.origin ?? "",
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const specs = {
      material: form.material || undefined,
      fit: form.fit || undefined,
      care: form.care || undefined,
      origin: form.origin || undefined,
    };

    if (editingId) {
      await fetch(`/api/admin/products/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          price: parseFloat(form.price),
          compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
          categoryId: form.categoryId,
          description: form.description || "A thoughtfully crafted essential.",
          ...specs,
        }),
      });
    } else {
      await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          price: parseFloat(form.price),
          compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
          categoryId: form.categoryId,
          description: form.description || "A thoughtfully crafted essential.",
          stock: parseInt(form.stock, 10) || 0,
          ...specs,
        }),
      });
    }

    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <button
          onClick={openAdd}
          className="h-10 px-5 bg-[#111] text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-[#333]"
        >
          + Add Product
        </button>
      </div>

      <div className="relative max-w-80">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full h-10 pl-9 pr-3.5 border border-[#e5e5e5] rounded-lg text-sm outline-none bg-white"
        />
      </div>

      <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[720px]">
            <thead>
              <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
                <Th>Product</Th>
                <Th>Category</Th>
                <Th>Price</Th>
                <Th>Stock</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const sm = stockMeta(p.stockStatus);
                return (
                  <tr key={p.id} className="border-t border-[#f5f5f5] hover:bg-[#fafafa]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-[#f5f5f4] shrink-0">
                          <img src={p.imgUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{p.name}</div>
                          <div className="text-xs text-[#aaa]">ID: {p.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-[#555]">{p.category}</td>
                    <td className="px-5 py-3 text-sm font-semibold">{money(p.price)}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setManagingStockFor(p)}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium cursor-pointer hover:opacity-80"
                        style={{ background: sm.bg, color: sm.color }}
                        title="Manage stock"
                      >
                        {sm.label} ({p.totalStock})
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setManagingStockFor(p)}
                          className="h-8 px-3 bg-[#eff6ff] text-[#1B4FD8] rounded-md text-xs font-medium cursor-pointer hover:bg-[#dbeafe] flex items-center gap-1"
                        >
                          <Boxes size={12} /> Stock
                        </button>
                        <button
                          onClick={() => setManagingImagesFor(p)}
                          className="h-8 px-3 bg-[#f0fdf4] text-green-700 rounded-md text-xs font-medium cursor-pointer hover:bg-green-100 flex items-center gap-1"
                        >
                          <ImageIcon size={12} /> Images
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          className="h-8 px-3 bg-[#f5f5f4] text-[#555] rounded-md text-xs font-medium cursor-pointer hover:bg-[#e5e5e4] hover:text-[#111]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="h-8 px-3 bg-red-50 text-red-600 rounded-md text-xs font-medium cursor-pointer hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#aaa]">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/45 z-200 flex items-center justify-center p-4 sm:p-6">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl p-6 sm:p-8 max-w-135 w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">{editingId ? "Edit Product" : "Add New Product"}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-[#aaa] hover:text-[#111] cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="border-2 border-dashed border-[#e5e5e5] rounded-xl p-7 text-center text-[#bbb]">
                <Upload size={24} className="mx-auto mb-2" />
                <p className="text-sm text-[#aaa]">Auto-generated placeholder image</p>
              </div>
              <Field label="Product name">
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Classic Essential Tee"
                  className="h-11 px-3.5 border border-[#e5e5e5] rounded-lg text-sm outline-none focus:border-[#1B4FD8]"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price ($)">
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                    className="h-11 px-3.5 border border-[#e5e5e5] rounded-lg text-sm outline-none focus:border-[#1B4FD8]"
                  />
                </Field>
                <Field label="Compare price ($)">
                  <input
                    type="number"
                    step="0.01"
                    value={form.compareAtPrice}
                    onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                    placeholder="0.00"
                    className="h-11 px-3.5 border border-[#e5e5e5] rounded-lg text-sm outline-none focus:border-[#1B4FD8]"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="h-11 px-3.5 border border-[#e5e5e5] rounded-lg text-sm outline-none bg-white cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                {!editingId && (
                  <Field label="Initial stock">
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      placeholder="10"
                      className="h-11 px-3.5 border border-[#e5e5e5] rounded-lg text-sm outline-none focus:border-[#1B4FD8]"
                    />
                  </Field>
                )}
              </div>
              {!editingId && (
                <p className="text-xs text-[#aaa] -mt-1">
                  Creates a single &quot;One Size&quot; variant with this stock. Add real sizes/colors afterward via the
                  Stock manager.
                </p>
              )}
              <Field label="Description">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the product…"
                  className="px-3.5 py-3 border border-[#e5e5e5] rounded-lg text-sm outline-none resize-vertical focus:border-[#1B4FD8]"
                />
              </Field>

              <div className="border-t border-[#f0f0f0] pt-4 mt-1">
                <p className="text-[13px] font-semibold mb-3">Specifications (shown on product page)</p>
                <div className="flex flex-col gap-3">
                  <Field label="Material">
                    <input
                      value={form.material}
                      onChange={(e) => setForm({ ...form, material: e.target.value })}
                      placeholder="e.g. 100% Premium Cotton"
                      className="h-11 px-3.5 border border-[#e5e5e5] rounded-lg text-sm outline-none focus:border-[#1B4FD8]"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Fit">
                      <input
                        value={form.fit}
                        onChange={(e) => setForm({ ...form, fit: e.target.value })}
                        placeholder="e.g. Regular / Relaxed"
                        className="h-11 px-3.5 border border-[#e5e5e5] rounded-lg text-sm outline-none focus:border-[#1B4FD8]"
                      />
                    </Field>
                    <Field label="Care">
                      <input
                        value={form.care}
                        onChange={(e) => setForm({ ...form, care: e.target.value })}
                        placeholder="e.g. Machine wash 30°C"
                        className="h-11 px-3.5 border border-[#e5e5e5] rounded-lg text-sm outline-none focus:border-[#1B4FD8]"
                      />
                    </Field>
                  </div>
                  <Field label="Origin">
                    <input
                      value={form.origin}
                      onChange={(e) => setForm({ ...form, origin: e.target.value })}
                      placeholder="e.g. Made in Portugal"
                      className="h-11 px-3.5 border border-[#e5e5e5] rounded-lg text-sm outline-none focus:border-[#1B4FD8]"
                    />
                  </Field>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 h-12 bg-[#f5f5f4] text-[#555] rounded-xl text-sm font-medium cursor-pointer hover:bg-[#e5e5e4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-12 bg-[#111] text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-[#333] disabled:opacity-60"
                >
                  {saving ? "Saving…" : editingId ? "Update Product" : "Save Product"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {managingStockFor && (
        <AdminVariantManager
          productId={managingStockFor.id}
          productName={managingStockFor.name}
          onClose={() => setManagingStockFor(null)}
        />
      )}

      {managingImagesFor && (
        <AdminImageManager
          productId={managingImagesFor.id}
          productName={managingImagesFor.name}
          onClose={() => setManagingImagesFor(null)}
        />
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-[#555]">{label}</label>
      {children}
    </div>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th className={`px-5 py-2.5 text-${align} text-[11px] font-bold text-[#aaa] uppercase tracking-wider`}>
      {children}
    </th>
  );
}
