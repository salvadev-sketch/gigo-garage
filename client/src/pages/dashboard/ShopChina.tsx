import { useCallback, useEffect, useState } from "react";
import { AdminCtx } from "../../components/AdminGate";
import { api } from "../../api";
import type { ChinaRequest, ChinaStatus } from "../../../../shared/types";

const flow: ChinaStatus[] = ["requested", "quoted", "ordered", "shipped", "arrived", "ready"];
const label: Record<ChinaStatus, string> = {
  requested: "Requested", quoted: "Quoted", ordered: "Ordered", shipped: "Shipped", arrived: "Arrived", ready: "Ready",
};

function Row({ r, admin, reload }: { r: ChinaRequest; admin: AdminCtx; reload: () => void }) {
  const [quote, setQuote] = useState(r.quote?.toString() ?? "");
  const [deposit, setDeposit] = useState(r.deposit?.toString() ?? "");
  const patch = async (body: object) => {
    await api(`/china-requests/${r._id}`, { method: "PATCH", headers: admin.headers, body: JSON.stringify(body) });
    reload();
  };
  const nextStatus = flow[flow.indexOf(r.status) + 1];

  return (
    <tr>
      <td><b>{r.requestNo}</b><br />{r.partNo ?? "—"}<br /><span className="muted">{[r.vehicle, r.notes].filter(Boolean).join(" · ")}</span></td>
      <td>{r.phone}</td>
      <td>
        <div className="actions">
          <input className="mini" type="number" min="0" placeholder="Quote" value={quote} onChange={(e) => setQuote(e.target.value)} aria-label="Quote in BIF" />
          <input className="mini" type="number" min="0" placeholder="Deposit" value={deposit} onChange={(e) => setDeposit(e.target.value)} aria-label="Deposit in BIF" />
          <button className="btn btn-outline" onClick={() => patch({ quote: Number(quote), deposit: Number(deposit), status: r.status === "requested" ? "quoted" : r.status })}>Save</button>
        </div>
      </td>
      <td><span className="badge wait">{label[r.status]}</span></td>
      <td>{nextStatus && <button className="btn btn-primary btn-sm" onClick={() => patch({ status: nextStatus })}>Mark {label[nextStatus].toLowerCase()}</button>}</td>
    </tr>
  );
}

export default function ShopChina({ admin }: { admin: AdminCtx }) {
  const [rows, setRows] = useState<ChinaRequest[]>([]);
  const load = useCallback(() => {
    api<ChinaRequest[]>("/china-requests", { headers: admin.headers }).then(setRows).catch(() => admin.signOut());
  }, [admin]);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="qwrap">
      <table className="qtable" style={{ minWidth: 820 }}>
        <thead><tr><th>Part / vehicle</th><th>Phone</th><th>Quote &amp; deposit (BIF)</th><th>Status</th><th>Next step</th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={5} className="empty">No China requests yet.</td></tr>}
          {rows.map((r) => <Row key={r._id} r={r} admin={admin} reload={load} />)}
        </tbody>
      </table>
    </div>
  );
}
