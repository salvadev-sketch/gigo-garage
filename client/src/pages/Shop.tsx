import { useEffect, useState } from "react";
import { api } from "../api";
import type { Part } from "../../../shared/types";

export default function Shop() {
  const [shop, setShop] = useState<Part[]>([]);
  const [china, setChina] = useState<Part[]>([]);

  useEffect(() => {
    api<Part[]>("/parts?source=shop").then(setShop).catch(console.error);
    api<Part[]>("/parts?source=china").then(setChina).catch(console.error);
  }, []);

  const list = (parts: Part[], action: string) => (
    <ul>{parts.map((p) => (
      <li key={p._id}>{p.name} · {p.price} BIF <button>{action}</button></li>
    ))}</ul>
  );

  return (
    <main style={{ padding: 24 }}>
      <h1>Spare parts</h1>
      <h2>Available in shop</h2>{list(shop, "Add to cart")}
      <h2>Available in China</h2>{list(china, "Request quote")}
    </main>
  );
}
