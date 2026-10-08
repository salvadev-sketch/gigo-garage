import { useCallback, useEffect, useState } from "react";
import { AdminCtx } from "../../components/AdminGate";
import { api, ApiError } from "../../api";
import { bif } from "../../format";
import type { Order } from "../../../../shared/types";

const next: Partial<Record<Order["status"], { label: string; to: Order["status"] }>> = {
  pending: { label: "Confirm payment", to: "paid" },
  paid: { label: "Mark done", to: "done" },
};
const canCancel: Order["status"][] = ["pending", "paid"];
const ui: Record<Order["status"], { text: string; cls: string }> = {
  pending: { text: "Awaiting payment", cls: "wait" },
  paid: { text: "Paid", cls: "conf" },
  done: { text: "Done", cls: "wait" },
  cancelled: { text: "Cancelled", cls: "wait" },
};

export default function ShopOrders({ admin }: { admin: AdminCtx }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<"open" | "done">("open");

  const load = useCallback(() => {
    api<Order[]>("/orders", { headers: admin.headers }).then(setOrders).catch(() => admin.signOut());
  }, [admin]);
  useEffect(() => { load(); }, [load]);

  const setStatus = async (o: Order, status: Order["status"]) => {
    if (status === "cancelled" && !window.confirm(`Cancel ${o.orderNo}? Stock goes back and this cannot be undone.`)) return;
    try {
      await api(`/orders/${o._id}`, { method: "PATCH", headers: admin.headers, body: JSON.stringify({ status }) });
    } catch (e) {
      window.alert(e instanceof ApiError ? e.message : "Could not update the order.");
    }
    load();
  };

  const list = orders.filter((o) => (tab === "open" ? o.status === "pending" || o.status === "paid" : o.status === "done" || o.status === "cancelled"));

  return (
    <>
      <div className="tabs" style={{ marginTop: 0 }}>
        <button className={`btn ${tab === "open" ? "btn-primary" : "btn-light"}`} onClick={() => setTab("open")}>Open orders</button>
        <button className={`btn ${tab === "done" ? "btn-primary" : "btn-light"}`} onClick={() => setTab("done")}>Done / cancelled</button>
      </div>
      <div className="qwrap">
        <table className="qtable" style={{ minWidth: 900 }}>
          <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Delivery</th><th>Payment</th><th>Due now</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={8} className="empty">No orders here.</td></tr>}
            {list.map((o) => (
              <tr key={o._id}>
                <td><b>{o.orderNo}</b></td>
                <td>{o.customerName}<br /><span className="muted">{o.phone}</span></td>
                <td>{o.items.map((i) => `${i.name} × ${i.qty}${i.source === "china" ? " (China)" : ""}`).join(", ")}</td>
                <td>{o.delivery === "delivery" ? `Delivery: ${o.address ?? ""}` : "Pick up"}</td>
                <td>{o.payment === "lumicash" ? "Lumicash" : "Bank"}{o.paymentProof ? <><br /><span className="muted">Ref: {o.paymentProof}</span></> : null}</td>
                <td>{bif(o.total)}</td>
                <td><span className={`badge ${ui[o.status].cls}`}>{ui[o.status].text}</span>{o.confirmedBy ? <><br /><span className="muted">By {o.confirmedBy}</span></> : null}</td>
                <td>{next[o.status] && <button className="btn btn-primary btn-sm" onClick={() => setStatus(o, next[o.status]!.to)}>{next[o.status]!.label}</button>}{canCancel.includes(o.status) && <button className="btn btn-outline btn-sm" style={{ marginLeft: 8 }} onClick={() => setStatus(o, "cancelled")}>Cancel</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
