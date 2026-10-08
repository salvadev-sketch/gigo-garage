import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import { bif } from "../format";
import type { OrderTrack } from "../../../shared/types";

const flow = [
  { id: "pending", text: "Order received, awaiting payment confirmation" },
  { id: "paid", text: "Payment confirmed, we are preparing your order" },
  { id: "done", text: "Completed" },
];

/** Customers follow an order with the number they were given. No personal data is shown. */
export default function TrackOrder() {
  const [params] = useSearchParams();
  const [no, setNo] = useState(params.get("no") ?? "");
  const [found, setFound] = useState<OrderTrack | "none" | null>(null);

  const check = async (value: string) => {
    if (!value.trim()) return;
    try { setFound(await api<OrderTrack>(`/orders/track/${encodeURIComponent(value.trim())}`)); } catch { setFound("none"); }
  };
  useEffect(() => { if (params.get("no")) void check(params.get("no") as string); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const submit = (e: FormEvent) => { e.preventDefault(); void check(no); };
  const idx = found && found !== "none" ? flow.findIndex((s) => s.id === found.status) : -1;

  return (
    <main className="container" style={{ paddingBottom: 96, maxWidth: 640 }}>
      <p className="crumb">Home / Track order</p>
      <h1 style={{ margin: "0 0 24px", fontSize: 40 }}>Track your order</h1>
      <form className="track" onSubmit={submit}>
        <label><span style={{ position: "absolute", left: -9999 }}>Order number</span>
          <input placeholder="Order number, e.g. OR-0001" value={no} onChange={(e) => setNo(e.target.value)} />
        </label>
        <button className="btn btn-light" type="submit">Check</button>
      </form>
      {found === "none" && <p className="msg-err" role="alert">Order number not found.</p>}
      {found && found !== "none" && (
        <div className="card-gray">
          <b style={{ fontSize: 20 }}>{found.orderNo}</b>
          <span className="muted">Total due now {bif(found.total)} · {found.payment === "lumicash" ? "Lumicash" : "Bank transfer"} · {found.delivery === "delivery" ? "Delivery" : "Pick up"}</span>
          {found.status === "cancelled"
            ? <p className="msg-err" style={{ margin: 0 }}>This order was cancelled. Contact us if you think this is a mistake.</p>
            : <ol className="steps">{flow.map((s, i) => <li key={s.id} className={i < idx ? "done" : i === idx ? "now" : ""}>{s.text}</li>)}</ol>}
        </div>
      )}
    </main>
  );
}
