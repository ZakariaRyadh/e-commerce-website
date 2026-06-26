"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Upload, Trash2 } from "lucide-react";

type Image = { id: string; url: string };

export function AdminImageManager({
  productId,
  productName,
  onClose,
}: {
  productId: string;
  productName: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch(`/api/admin/products/${productId}/images`)
      .then((r) => r.json())
      .then((data: Image[]) => {
        setImages(data);
        setLoading(false);
      });
  }

  useEffect(load, [productId]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/admin/products/${productId}/images`, { method: "POST", body: formData });
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Upload failed");
      return;
    }

    load();
    router.refresh();
  }

  async function remove(imageId: string) {
    if (!confirm("Remove this image?")) return;
    await fetch(`/api/admin/products/${productId}/images/${imageId}`, { method: "DELETE" });
    load();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 bg-black/45 z-200 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-lg font-bold">Manage Images</h2>
          <button onClick={onClose} className="text-[#aaa] hover:text-[#111] cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-[#888] mb-5">{productName}</p>

        {loading ? (
          <p className="text-sm text-[#aaa] py-8 text-center">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-5">
              {images.map((img) => (
                <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-[#f5f5f4] group">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => remove(img.id)}
                    className="absolute top-1.5 right-1.5 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-50"
                  >
                    <Trash2 size={13} className="text-red-600" />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-[#e5e5e5] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#1B4FD8] hover:bg-[#f0f5ff]">
                <Upload size={18} className="text-[#bbb]" />
                <span className="text-[11px] text-[#aaa]">{uploading ? "Uploading…" : "Add"}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {error && <p className="text-[13px] text-red-600 mb-3">{error}</p>}
            <p className="text-xs text-[#aaa] mb-5">JPG, PNG, or WebP — up to 5MB each.</p>

            <button
              onClick={onClose}
              className="w-full h-11 bg-[#f5f5f4] text-[#555] rounded-xl text-sm font-medium cursor-pointer hover:bg-[#e5e5e4]"
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}
