import { FormEvent, ReactNode, useCallback, useEffect, useState } from "react";
import { api } from "../api";
import type { Booking, BookingStatus, QueueItem } from "../../../shared/types";

const icon = { width: 32, height: 32, viewBox: "0 0 24 24", fill: "none", stroke: "#0B6B4F", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const services: { name: string; text: string; svg: ReactNode }[] = [
  { name: "Diagnostics", text: "Scan and read fault codes on EV and hybrid systems", svg: <path d="M3 12h4l2-6 4 12 2-6h6" /> },
  { name: "Battery check & repair", text: "Health tests, module replacement, cooling", svg: <><rect x="3" y="7" width="16" height="10" rx="2" /><path d="M21 10v4" /></> },
  { name: "Brakes & suspension", text: "Pads, discs, shocks and alignment", svg: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></> },
  { name: "Oil, filters & fluids", text: "Regular maintenance for hybrid and petrol cars", svg: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" /> },
  { name: "AC & cooling", text: "Gas, compressor, radiator and pumps", svg: <path d="M12 3v18M4 7.5l16 9M4 16.5l16-9" /> },
  { name: "Charging system", text: "Charging port, onboard charger and wiring", svg: <path d="M13 3L5 14h6l-1 7 8-11h-6z" /> },
];

const statusLabel: Record<string, { text: string; cls: string }> = {
  pending: { text: "Waiting", cls: "wait" },
  confirmed: { text: "Confirmed", cls: "conf" },
  in_progress: { text: "In progress", cls: "prog" },
};
const labelFor = (s: BookingStatus) => statusLabel[s] ?? { text: s === "done" ? "Done" : "Cancelled", cls: "wait" };
const ID_KEY = "gigo-car-id";

const makes = ["Toyota", "Nissan", "Honda", "Mitsubishi", "Suzuki", "Subaru", "Other"];
const thisYear = new Date().getFullYear();
const years = Array.from({ length: thisYear - 1999 }, (_, i) => thisYear - i);

type Form = { customerName: string; phone: string; make: string; model: string; year: string; chassisNo: string; service: string; date: string; time: string; notes: string };
const empty: Form = { customerName: "", phone: "", make: "", model: "", year: "", chassisNo: "", service: "", date: "", time: "", notes: "" };

export default function Garage() {
  const [form, setForm] = useState<Form>(empty);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [result, setResult] = useState<{ carId: string; position: number } | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [myId, setMyId] = useState<string>(() => { try { return localStorage.getItem(ID_KEY) ?? ""; } catch { return ""; } });
  const [trackId, setTrackId] = useState("");
  const [tracked, setTracked] = useState<QueueItem | "none" | null>(null);

  const loadQueue = useCallback(() => {
    api<QueueItem[]>("/queue").then(setQueue).catch(() => setQueue([]));
  }, []);
  useEffect(() => { loadQueue(); }, [loadQueue]);
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const body: Partial<Booking> = { ...form, year: form.year ? Number(form.year) : undefined };
      const res = await api<{ carId: string; position: number }>("/bookings", { method: "POST", body: JSON.stringify(body) });
      setResult(res);
      setMyId(res.carId);
      try { localStorage.setItem(ID_KEY, res.carId); } catch { /* storage unavailable */ }
      setForm(empty);
      setStatus("done");
      loadQueue();
    } catch {
      setStatus("error");
    }
  };

  const track = async (e: FormEvent) => {
    e.preventDefault();
    try { setTracked(await api<QueueItem>(`/track/${encodeURIComponent(trackId.trim())}`)); } catch { setTracked("none"); }
  };

  return (
    <main className="container">
      <section className="garage-hero">
        <div>
          <p className="eyebrow">EV &amp; hybrid garage</p>
          <h1>Repair and maintenance for electric and hybrid cars.</h1>
          <p>Book a time for your car. We use the right parts from our shop, or order them from China for you.</p>
          <a href="#book" className="btn btn-primary">Book a service</a>
        </div>
        <div className="ph">[PHOTO OF THE GARAGE]</div>
      </section>

      <section className="section">
        <div className="title"><h2>Our services</h2><div /></div>
        <div className="grid3">
          {services.map((s) => (
            <div className="service" key={s.name}>
              <svg {...icon} aria-hidden="true">{s.svg}</svg>
              <b>{s.name}</b>
              <span>{s.text}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="book" className="book">
        <div className="book-info">
          <h2>Book a service</h2>
          <p>Fill in your car and the time that suits you. We confirm by SMS or WhatsApp.</p>
          <p style={{ lineHeight: 1.9, color: "var(--ink)", fontSize: 16 }}>
            <b>Opening hours</b><br />[OPENING HOURS]<br /><br /><b>Location</b><br />[YOUR ADDRESS]
          </p>
        </div>
        <form className="form-card" onSubmit={submit}>
          <label className="field">Full name<input required value={form.customerName} onChange={set("customerName")} /></label>
          <label className="field">Phone / WhatsApp<input required type="tel" value={form.phone} onChange={set("phone")} /></label>
          <div className="fields3">
            <label className="field">Make
              <select value={form.make} onChange={set("make")}><option value="">Select</option>{makes.map((m) => <option key={m}>{m}</option>)}</select>
            </label>
            <label className="field">Model<input value={form.model} onChange={set("model")} placeholder="e.g. Prius" /></label>
            <label className="field">Year
              <select value={form.year} onChange={set("year")}><option value="">Select</option>{years.map((y) => <option key={y}>{y}</option>)}</select>
            </label>
          </div>
          <label className="field">Chassis number (optional)<input value={form.chassisNo} onChange={set("chassisNo")} /></label>
          <label className="field">Service
            <select required value={form.service} onChange={set("service")}>
              <option value="">Select a service</option>{services.map((s) => <option key={s.name}>{s.name}</option>)}
            </select>
          </label>
          <div className="fields3">
            <label className="field">Preferred date<input type="date" min={new Date().toISOString().slice(0, 10)} value={form.date} onChange={set("date")} /></label>
            <label className="field">Preferred time<input type="time" value={form.time} onChange={set("time")} /></label>
          </div>
          <label className="field">Notes (optional)<textarea rows={3} value={form.notes} onChange={set("notes")} /></label>
          <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending..." : "Request booking"}
          </button>
          {status === "done" && result && (
            <div className="msg-ok" role="status">
              Booking received. Your Car ID:
              <span className="carid">{result.carId}</span>
              Position in the waiting list: {result.position}. Keep this ID. We confirm by SMS or WhatsApp.
            </div>
          )}
          {status === "error" && <p className="msg-err" role="alert">Something went wrong. Please try again.</p>}
        </form>
      </section>

      <section id="queue" className="section">
        <div className="title"><h2>Cars in the garage</h2><div /></div>
        <form className="track" onSubmit={track}>
          <label><span style={{ position: "absolute", left: -9999 }}>Car ID</span>
            <input placeholder="Check your Car ID, e.g. GA-0001" value={trackId} onChange={(e) => setTrackId(e.target.value)} />
          </label>
          <button className="btn btn-light" type="submit">Check</button>
        </form>
        {tracked === "none" && <p className="msg-err" role="alert">Car ID not found.</p>}
        {tracked && tracked !== "none" && (
          <p className="msg-ok" role="status">
            {tracked.valid === false
              ? `${tracked.carId} is no longer valid. The repair is complete or the booking is closed.`
              : `${tracked.carId}: ${labelFor(tracked.status).text}${tracked.position ? ` · position ${tracked.position} in the waiting list` : ""}`}
          </p>
        )}
        <div className="qwrap">
          <table className="qtable">
            <thead><tr><th>#</th><th>Car ID</th><th>Car</th><th>Service</th><th>Status</th></tr></thead>
            <tbody>
              {queue.length === 0 && <tr><td colSpan={5} className="empty">No cars waiting right now.</td></tr>}
              {queue.map((q) => (
                <tr key={q.carId} className={q.carId === myId ? "me" : ""}>
                  <td>{q.position}</td>
                  <td><b>{q.carId}</b>{q.carId === myId ? " (your car)" : ""}</td>
                  <td>{[q.make, q.model, q.year].filter(Boolean).join(" ")}</td>
                  <td>{q.service}</td>
                  <td><span className={`badge ${labelFor(q.status).cls}`}>{labelFor(q.status).text}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
