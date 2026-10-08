import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useCart } from "../components/CartContext";
import PartImage from "../components/PartImage";
import type { Part } from "../../../shared/types";

/** One part: what it fits, whether it is in stock, and add to cart with a quantity. */
export default function PartDetail() {
  const { id } = useParams();
  const { add } = useCart();
  const [part, setPart] = useState<Part | "none" | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setPart(null);
    api<Part>(`/parts/${id}`).then(setPart).catch(() => setPart("none"));
  }, [id]);

  if (part === null) return <main className="container"><p className="empty" style={{ marginTop: 32 }}>Loading...</p></main>;
  if (part === "none") return <main className="container"><p className="empty" style={{ marginTop: 32 }}>Part not found. <Link to="/shop"><b>Back to spare parts</b></Link></p></main>;

  const china = part.source === "china";
  const max = china ? 99 : Math.min(part.stock, 99);
  const out = !china && part.stock < 1;
  const years = part.years.length ? (part.years.length > 1 ? `${Math.min(...part.years)}–${Math.max(...part.years)}` : String(part.years[0])) : "All years";
  const stockText = china ? `From China${part.leadTimeWeeks ? ` · about ${part.leadTimeWeeks} weeks` : ""}`
    : out ? "Out of stock" : part.stock <= 5 ? `Only ${part.stock} left` : "In stock";

  const addToCart = () => { add(part, qty); setAdded(true); };

  return (
    <main className="container" style={{ paddingBottom: 96 }}>
      <p className="crumb"><Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / {part.name}</p>
      <div className="detail">
        <PartImage part={part} width={900} className="detail-ph" />
        <div className="stack" style={{ gap: 16 }}>
          <span className={`badge ${china ? "china" : "stock"}`} style={{ alignSelf: "flex-start" }}>{stockText}</span>
          <h1 style={{ margin: 0, fontSize: 40 }}>{part.name}</h1>
          <b style={{ fontSize: 28 }}>{part.price.toLocaleString()} BIF</b>
          <dl className="specs">
            <dt>Part number</dt><dd>{part.partNo}</dd>
            <dt>Category</dt><dd>{part.category}</dd>
            <dt>Fits</dt><dd>{[part.make, part.model].filter(Boolean).join(" ") || "Ask us"}</dd>
            <dt>Years</dt><dd>{years}</dd>
          </dl>
          {china && <p className="muted" style={{ margin: 0 }}>Not in stock here. We send you a quote first, you pay a deposit, then you track your order until it arrives.</p>}
          <div className="row" style={{ gap: 12, alignItems: "center" }}>
            <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>Quantity
              <input type="number" min={1} max={max} value={qty} disabled={out} style={{ width: 80 }}
                onChange={(e) => { setQty(Math.max(1, Math.min(max || 1, Number(e.target.value) || 1))); setAdded(false); }} />
            </label>
            <button className={`btn ${china ? "btn-green-outline" : "btn-primary"}`} disabled={out} onClick={addToCart}>
              {china ? "Request quote" : out ? "Sold out" : "Add to cart"}
            </button>
          </div>
          {added && <p className="msg-ok" style={{ margin: 0 }}>Added to your cart. <Link to="/cart"><b>View cart</b></Link></p>}
        </div>
      </div>
    </main>
  );
}
