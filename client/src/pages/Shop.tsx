import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useCart } from "../components/CartContext";
import type { Part } from "../../../shared/types";

type Sort = "relevance" | "asc" | "desc";

function PartCard({ part }: { part: Part }) {
  const { add } = useCart();
  const china = part.source === "china";
  return (
    <div className="part">
      <div className="ph">[PHOTO]</div>
      <span className={`badge ${china ? "china" : "stock"}`}>
        {china ? `From China${part.leadTimeWeeks ? ` · ${part.leadTimeWeeks} weeks` : ""}` : "In stock"}
      </span>
      <b style={{ fontSize: 18 }}>{part.name}</b>
      <span className="muted" style={{ fontSize: 14 }}>Fits: {part.make} {part.model} · {part.partNo}</span>
      <div className="foot">
        <b style={{ fontSize: 18 }}>{part.price.toLocaleString()} BIF</b>
        <button className={`btn btn-sm ${china ? "btn-green-outline" : "btn-primary"}`} onClick={() => add(part)}>
          {china ? "Request quote" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}

export default function Shop() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [cats, setCats] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>("relevance");

  useEffect(() => {
    api<Part[]>("/parts").then(setParts).catch(() => setParts([])).finally(() => setLoading(false));
  }, []);

  const makes = useMemo(() => [...new Set(parts.map((p) => p.make))].sort(), [parts]);
  const models = useMemo(() => [...new Set(parts.filter((p) => !make || p.make === make).map((p) => p.model))].sort(), [parts, make]);
  const years = useMemo(() => [...new Set(parts.flatMap((p) => p.years))].sort((a, b) => b - a), [parts]);
  const categories = useMemo(() => [...new Set(parts.map((p) => p.category))].sort(), [parts]);

  const visible = useMemo(() => {
    const list = parts.filter((p) =>
      (!make || p.make === make) && (!model || p.model === model) &&
      (!year || p.years.includes(Number(year))) && (!cats.length || cats.includes(p.category)));
    if (sort === "asc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "desc") return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [parts, make, model, year, cats, sort]);

  const toggleCat = (c: string) => setCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  const shop = visible.filter((p) => p.source === "shop");
  const china = visible.filter((p) => p.source === "china");
  const vehicle = [make, model, year].filter(Boolean).join(" · ");

  const group = (list: Part[]) =>
    list.length ? <div className="parts">{list.map((p) => <PartCard key={p._id} part={p} />)}</div>
      : <p className="empty">{loading ? "Loading parts..." : "No parts match your filters."}</p>;

  return (
    <main className="container">
      <p className="crumb">Home / Shop</p>
      <div className="shop-head">
        <div>
          <h1>Spare parts</h1>
          <p className="muted" style={{ margin: 0, fontSize: 17 }}>
            {vehicle ? <>Showing parts for <b style={{ color: "var(--ink)" }}>{vehicle}</b></> : "Showing all parts"}
          </p>
        </div>
        <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="relevance">Relevance</option>
            <option value="asc">Price: low to high</option>
            <option value="desc">Price: high to low</option>
          </select>
        </label>
      </div>
      <div className="tabs">
        <a href="#shop" className="btn btn-primary">Available in shop</a>
        <a href="#china" className="btn btn-light">Available in China</a>
      </div>
      <div className="shop-layout">
        <aside className="filters">
          <h2>Filters</h2>
          <label className="field">Make
            <select value={make} onChange={(e) => { setMake(e.target.value); setModel(""); }}>
              <option value="">All makes</option>{makes.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
          <div className="pair">
            <label className="field">Model
              <select value={model} onChange={(e) => setModel(e.target.value)}>
                <option value="">All</option>{models.map((m) => <option key={m}>{m}</option>)}
              </select>
            </label>
            <label className="field">Year
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">All</option>{years.map((y) => <option key={y}>{y}</option>)}
              </select>
            </label>
          </div>
          <div>
            <b style={{ fontSize: 15 }}>Category</b>
            {categories.map((c) => (
              <label className="check" key={c}>
                <input type="checkbox" checked={cats.includes(c)} onChange={() => toggleCat(c)} /> {c}
              </label>
            ))}
          </div>
        </aside>
        <div className="shop-main">
          <section id="shop">
            <div><h2>Available in shop</h2><p className="muted" style={{ margin: 0, maxWidth: 560 }}>Ready now. Add to your cart and pick up or get it delivered.</p></div>
            {group(shop)}
          </section>
          <section id="china">
            <div><h2>Available in China</h2><p className="muted" style={{ margin: 0, maxWidth: 560 }}>Not in stock here. We send you a quote first, you pay a deposit, then you track your order until it arrives. Part not listed? <Link to="/china" style={{ color: "var(--accent)", fontWeight: 700 }}>Request it from China</Link>.</p></div>
            {group(china)}
          </section>
        </div>
      </div>
    </main>
  );
}
