"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  imgUrl: string;
  qty: number;
  size?: string;
  color?: string;
};

type CartState = {
  items: CartItem[];
  promoCode: string;
  promoApplied: boolean;
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (productId: string, size?: string, color?: string) => void;
  updateQty: (productId: string, size: string | undefined, color: string | undefined, delta: number) => void;
  setPromoCode: (code: string) => void;
  applyPromo: () => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: "",
      promoApplied: false,
      addItem: (item) => {
        const items = get().items;
        const existing = items.find(
          (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
        );
        if (existing) {
          set({
            items: items.map((i) => (i === existing ? { ...i, qty: i.qty + 1 } : i)),
          });
        } else {
          set({ items: [...items, { ...item, qty: 1 }] });
        }
      },
      removeItem: (productId, size, color) =>
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && i.size === size && i.color === color)
          ),
        }),
      updateQty: (productId, size, color, delta) =>
        set({
          items: get()
            .items.map((i) =>
              i.productId === productId && i.size === size && i.color === color
                ? { ...i, qty: Math.max(0, i.qty + delta) }
                : i
            )
            .filter((i) => i.qty > 0),
        }),
      setPromoCode: (code) => set({ promoCode: code, promoApplied: false }),
      applyPromo: () => {
        if (get().promoCode.toLowerCase().trim() === "save10") set({ promoApplied: true });
      },
      clear: () => set({ items: [], promoCode: "", promoApplied: false }),
    }),
    { name: "luma-cart" }
  )
);

type WishlistState = {
  ids: string[];
  toggle: (id: string) => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set({
          ids: get().ids.includes(id) ? get().ids.filter((x) => x !== id) : [...get().ids, id],
        }),
    }),
    { name: "luma-wishlist" }
  )
);

type UiState = {
  cartOpen: boolean;
  searchOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
};

export const useUiStore = create<UiState>((set, get) => ({
  cartOpen: false,
  searchOpen: false,
  openCart: () => set({ cartOpen: true, searchOpen: false }),
  closeCart: () => set({ cartOpen: false }),
  toggleCart: () => set({ cartOpen: !get().cartOpen, searchOpen: false }),
  openSearch: () => set({ searchOpen: true, cartOpen: false }),
  closeSearch: () => set({ searchOpen: false }),
}));

type RecentSearchState = {
  terms: string[];
  add: (term: string) => void;
};

export const useRecentSearchStore = create<RecentSearchState>()(
  persist(
    (set, get) => ({
      terms: [],
      add: (term) => {
        const t = term.trim();
        if (!t) return;
        const terms = [t, ...get().terms.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 5);
        set({ terms });
      },
    }),
    { name: "luma-recent-searches" }
  )
);
