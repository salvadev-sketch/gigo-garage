import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "../api";
import type { Booking, BookingStatus } from "../../../shared/types";

const KEY = "gigo-admin-key";
const next: Partial<Record<BookingStatus, { label: string; to: BookingStatus }>> = {
  pending: { label: "Confirm", to: "confirmed" },
  confirmed: { label: "Start repair", to: "in_progress" },
  in_progress: { label: "Car fixed", to: "done" },
};
const statusUi: Record<BookingStatus, { text: string; cls: string }> = {
  pending: { text: "Waiting", cls: "wait" },
  confirmed: { text: "Confirmed", cls: "conf" },
  in_progress: { text: "In progress", cls: "prog" },
  done: { text: "Done", cls: "wait" },
  cancelled: { text: "Cancelled", cls: "wait" },
};
const isActive = (b: Booking) => b.status !== "done" && b.status !== "cancelled";

export default function Dashboard() {
  const [key, setKey] = useState(() => sessionStorage.getItem(KEY) ?? "");
  const [input, setInput] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"active" | "closed">("active");
  const [error, setError] = useState("");

  const headers = useCallback(() => ({ "x-admin-key": key }), [key]);

  const load = useCallback(() => {
    if (!key) return;
    api<Booking[]>("/bookings", { headers: headers() })
      .then((b) => { setBookings(b); setError(""); })
      .catch(() => { sessionStorage.removeItem(KEY); setKey(""); setError("Wrong admin key or server unavailable."); });
  }, [key, headers]);
  useEffect(() => { load(); }, [load]);

  const login = (e: FormEvent) => { e.preventDefault(); sessionStorage.setItem(KEY, input); setKey(input); setInput(""); };

  const setStatus = async (b: Booking, status: BookingStatus) => {
    if (status === "done" && !window.confirm(`Mark ${b.carId} as fixed? The Car ID will be invalidated and the car removed from the waiting list.`)) return;
    if (status === "cancelled" && !window.confirm(`Cancel ${b.carId}? The Car ID will be invalidated.`)) return;
    await api(`/bookings/${b._id}`, { method: "PATCH", headers: headers(), body: JSON.stringify({ status }) });
    load();
  };

  if (!key) {
    return (
      <main className="container" style={{ padding: "56px 24px 96px", maxWidth: 520 }}>
        <h1 style={{ fontSize: 36 }}>Seller Dashboard</h1>
        <form className="form-card" onSubmit={login}>
          <label className="field">Admin key<input type="password" required value={input} onChange={(e) => setInput(e.target.value)} /></label>
          <button className="btn btn-primary" type="submit">Sign in</button>
          {error && <p className="msg-err" role="alert">{error}</p>}
        </form>
      </main>
    );
  }

  const list = bookings.filter((b) => (tab === "active" ? isActive(b) : !isActive(b)));

  return (
    <main className="container" style={{ paddingBottom: 96 }}>
      <div className="shop-head" style={{ marginTop: 32 }}>
        <h1 style={{ margin: 0, fontSize: 44 }}>Bookings</h1>
        <button className="btn btn-outline" onClick={() => { sessionStorage.removeItem(KEY); setKey(""); }}>Sign out</button>
      </div>
      <div className="tabs">
        <button className={`btn ${tab === "active" ? "btn-primary" : "btn-light"}`} onClick={() => setTab("active")}>In the garage</button>
        <button className={`btn ${tab === "closed" ? "btn-primary" : "btn-light"}`} onClick={() => setTab("closed")}>Closed</button>
      </div>
      <div className="qwrap">
        <table className="qtable" style={{ minWidth: 820 }}>
          <thead><tr><th>Car ID</th><th>Customer</th><th>Car</th><th>Service</th><th>Date &amp; time</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={7} className="empty">No bookings here.</td></tr>}
            {list.map((b) => (
              <tr key={b._id}>
                <td><b>{b.carId}</b></td>
                <td>{b.customerName}<br /><span className="muted">{b.phone}</span></td>
                <td>{[b.make, b.model, b.year].filter(Boolean).join(" ")}</td>
                <td>{b.service}</td>
                <td>{[b.date, b.time].filter(Boolean).join(" · ")}</td>
                <td><span className={`badge ${statusUi[b.status].cls}`}>{statusUi[b.status].text}</span></td>
                <td style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {isActive(b) ? (
                    <>
                      {next[b.status] && <button className="btn btn-primary btn-sm" onClick={() => setStatus(b, next[b.status]!.to)}>{next[b.status]!.label}</button>}
                      <button className="btn btn-outline" onClick={() => setStatus(b, "cancelled")}>Cancel</button>
                    </>
                  ) : <span className="muted">Car ID no longer valid</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
