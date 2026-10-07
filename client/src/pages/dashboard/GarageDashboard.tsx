import { useCallback, useEffect, useState } from "react";
import AdminGate, { AdminCtx } from "../../components/AdminGate";
import { api } from "../../api";
import type { Booking, BookingStatus } from "../../../../shared/types";

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

function Bookings({ admin }: { admin: AdminCtx }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"active" | "closed">("active");

  const load = useCallback(() => {
    api<Booking[]>("/bookings", { headers: admin.headers }).then(setBookings).catch(() => admin.signOut());
  }, [admin]);
  useEffect(() => { load(); }, [load]);

  const setStatus = async (b: Booking, status: BookingStatus) => {
    if (status === "done" && !window.confirm(`Mark ${b.carId} as fixed? The Car ID will be invalidated and the car removed from the waiting list.`)) return;
    if (status === "cancelled" && !window.confirm(`Cancel ${b.carId}? The Car ID will be invalidated.`)) return;
    await api(`/bookings/${b._id}`, { method: "PATCH", headers: admin.headers, body: JSON.stringify({ status }) });
    load();
  };

  const list = bookings.filter((b) => (tab === "active" ? isActive(b) : !isActive(b)));

  return (
    <main className="container" style={{ paddingBottom: 96 }}>
      <div className="shop-head" style={{ marginTop: 32 }}>
        <h1 style={{ margin: 0, fontSize: 44 }}>Garage dashboard</h1>
        <button className="btn btn-outline" onClick={admin.signOut}>Sign out</button>
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
                <td>
                  {isActive(b) ? (
                    <div className="actions">
                      {next[b.status] && <button className="btn btn-primary btn-sm" onClick={() => setStatus(b, next[b.status]!.to)}>{next[b.status]!.label}</button>}
                      <button className="btn btn-outline" onClick={() => setStatus(b, "cancelled")}>Cancel</button>
                    </div>
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

export default function GarageDashboard() {
  return <AdminGate role="garage" title="Garage dashboard">{(admin) => <Bookings admin={admin} />}</AdminGate>;
}
