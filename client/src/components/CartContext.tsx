import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import type { Part } from "../../../shared/types";

export interface CartItem { part: Part; qty: number }
interface CartCtx {
  items: CartItem[]; count: number;
  add: (p: Part) => void; remove: (id: string) => void;
  setQty: (id: string, qty: number) => void; clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "gigo-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") as CartItem[]; } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage unavailable */ }
  }, [items]);

  const add = (part: Part) => setItems((prev) =>
    prev.some((i) => i.part._id === part._id)
      ? prev.map((i) => (i.part._id === part._id ? { ...i, qty: i.qty + 1 } : i))
      : [...prev, { part, qty: 1 }]);
  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.part._id !== id));
  const setQty = (id: string, qty: number) =>
    setItems((prev) => prev.map((i) => (i.part._id === id ? { ...i, qty: Math.max(1, qty) } : i)));
  const clear = () => setItems([]);
  const count = items.reduce((n, i) => n + i.qty, 0);

  return <Ctx.Provider value={{ items, count, add, remove, setQty, clear }}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
