import { FormEvent, useCallback, useEffect, useState } from "react";
import { AdminCtx } from "../../components/AdminGate";
import { api } from "../../api";
import { bif } from "../../format";
import type { Part } from "../../../../shared/types";

const blank = { name: "", category: "", partNo: "", make: "", model: "", years: "", price: "", stock: "0", source: "shop", leadTimeWeeks: "" };

function PartRow({ p, admin, reload }: { p: Part; admin: AdminCtx; reload: () => void }) {
  const [price, setPrice] = useState(String(p.price));
  const [stock, setStock] = useState(String(p.stock));
  const save = async () => {
    await api(`/parts/${p._id}`, { method: "PATCH", headers: admin.headers, body: JSON.stringify({ price: Number(price), stock: Number(stock) }) });
    reload();
  };
  const del = async () => {
    if (!window.confirm(`Delete ${p.name}?`)) return;
    await api(`/parts/${p._id}`, { method: "DELETE", headers: admin.headers });
    reload();
  };
  return (
    <tr>
      <td><b>{p.name}</b><br /><span className="muted">{p.partNo}</span></td>
      <td>{p.make} {p.model}<br /><span className="muted">{p.years.join(", ")}</span></td>
      <td>{p.category}</td>
      <td><span className={`badge ${p.source === "china" ? "china" : "stock"}`}>{p.source === "china" ? "China" : "Shop"}</span></td>
      <td>
        <div className="actions">
          <input className="mini" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} aria-label={`Price of ${p.name}`} />
          <input className="mini" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} aria-label={`Stock of ${p.name}`} />
        </div>
        <span className="muted" style={{ fontSize: 12 }}>Price (now {bif(p.price)}) · Stock</span>
      </td>
      <td><div className="actions"><button className="btn btn-outline" onClick={save}>Save</button><button className="btn btn-outline" onClick={del}>Delete</button></div></td>
    </tr>
  );
}

export default function ShopParts({ admin }: { admin: AdminCtx }) {
  const [parts, setParts] = useState<Part[]>([]);
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof blank) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));

  const load = useCallback(() => {
    api<Part[]>("/parts").then(setParts).catch(() => setParts([]));
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    await api("/parts", {
      method: "POST", headers: admin.headers,
      body: JSON.stringify({
        ...f, years: f.years.split(",").map((y) => Number(y.trim())).filter(Boolean),
        price: Number(f.price), stock: Number(f.stock), leadTimeWeeks: f.leadTimeWeeks ? Number(f.leadTimeWeeks) : undefined,
      }),
    });
    setF(blank);
    load();
  };

  return (
    <>
      <form className="card-gray add-form" onSubmit={add}>
        <h2>Add a part</h2>
        <div className="fields3">
          <label className="field">Name<input required value={f.name} onChange={set("name")} /></label>
          <label className="field">Category<input required value={f.category} onChange={set("category")} /></label>
          <label className="field">Part number<input required value={f.partNo} onChange={set("partNo")} /></label>
        </div>
        <div className="fields3">
          <label className="field">Make<input required value={f.make} onChange={set("make")} /></label>
          <label className="field">Model<input required value={f.model} onChange={set("model")} /></label>
          <label className="field">Years (comma separated)<input required value={f.years} onChange={set("years")} placeholder="2010, 2011, 2012" /></label>
        </div>
        <div className="fields3">
          <label className="field">Price (BIF)<input required type="number" min="0" value={f.price} onChange={set("price")} /></label>
          <label className="field">Stock<input type="number" min="0" value={f.stock} onChange={set("stock")} /></label>
          <label className="field">Available
            <select value={f.source} onChange={set("source")}><option value="shop">In shop</option><option value="china">In China</option></select>
          </label>
          {f.source === "china" && <label className="field">Lead time (weeks)<input type="number" min="1" value={f.leadTimeWeeks} onChange={set("leadTimeWeeks")} /></label>}
        </div>
        <button className="btn btn-primary" type="submit" style={{ alignSelf: "flex-start" }}>Add part</button>
      </form>
      <div className="qwrap">
        <table className="qtable" style={{ minWidth: 900 }}>
          <thead><tr><th>Part</th><th>Fits</th><th>Category</th><th>Source</th><th>Price &amp; stock</th><th>Actions</th></tr></thead>
          <tbody>
            {parts.length === 0 && <tr><td colSpan={6} className="empty">No parts yet.</td></tr>}
            {parts.map((p) => <PartRow key={p._id} p={p} admin={admin} reload={load} />)}
          </tbody>
        </table>
      </div>
    </>
  );
}
