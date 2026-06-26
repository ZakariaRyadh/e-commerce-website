export function money(n: number | string) {
  return `$${Number(n).toFixed(2).replace(/\.00$/, "")}`;
}

export function stockMeta(status: "IN_STOCK" | "LOW_STOCK" | "SOLD_OUT") {
  switch (status) {
    case "LOW_STOCK":
      return { label: "Low Stock", color: "#d97706", bg: "#fffbeb" };
    case "SOLD_OUT":
      return { label: "Sold Out", color: "#dc2626", bg: "#fef2f2" };
    default:
      return { label: "In Stock", color: "#16a34a", bg: "#f0fdf4" };
  }
}

export function badgeMeta(badge?: string | null) {
  if (badge === "Sale") return { bg: "#fef2f2", color: "#dc2626" };
  if (badge === "New") return { bg: "#f0fdf4", color: "#16a34a" };
  return null;
}

const COLOR_MAP: Record<string, string> = {
  Black: "#111",
  White: "#f5f5f4",
  Navy: "#1e3a5f",
  Sand: "#d4b896",
  Olive: "#6b7c45",
  Stone: "#a09882",
  Oatmeal: "#e8dcc8",
  Charcoal: "#3d3d3d",
  Rust: "#b5491e",
  Cream: "#f0ece4",
  Brown: "#7c4f2a",
  Tan: "#c9a96e",
  Burgundy: "#6b1f2a",
};

export function colorSwatch(name: string) {
  return COLOR_MAP[name] || "#888";
}
