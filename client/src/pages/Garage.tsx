import { FormEvent, ReactNode, useState } from "react";
import { api } from "../api";
import type { Booking } from "../../../shared/types";

const icon = { width: 32, height: 32, viewBox: "0 0 24 24", fill: "none", stroke: "#0B6B4F", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const services: { name: string; text: string; svg: ReactNode }[] = [
  { name: "Diagnostics", text: "Scan and read fault codes on EV and hybrid systems", svg: <path d="M3 12h4l2-6 4 12 2-6h6" /> },
  { name: "Battery check & repair", text: "Health tests, module replacement, cooling", svg: <><rect x="3" y="7" width="16" height="10" rx="2" /><path d="M21 10v4" /></> },
  { name: "Brakes & suspension", text: "Pads, discs, shocks and alignment", svg: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></> },
  { name: "Oil, filters & fluids", text: "Regular maintenance for hybrid and petrol cars", svg: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" /> },
  { name: "AC & cooling", text: "Gas, compressor, radiator and pumps", svg: <path d="M12 3v18M4 7.5l16 9M4 16.5l16-9" /> },
  { name: "Charging system", text: "Charging port, onboard charger and wiring", svg: <path d="M13 3L5 14h6l-1 7 8-11h-6z" /> },
];

const makes = ["Toyota", "Nissan", "Honda", "Mitsubishi", "Suzuki", "Subaru", "Other"];
const thisYear = new Date().getFullYear();
const years = Array.from({ length: thisYear - 1999 }, (_, i) => thisYear - i);

type Form = { customerName: string; phone: string; make: string; model: string; year: string; chassisNo: string; service: string; date: string; time: string; notes: string };
const empty: Form = { customerName: "", phone: "", make: "", model: "", year: "", chassisNo: "", service: "", date: "", time: "", notes: "" };

export default function Garage() {
  const [form, setForm] = useState<Form>(empty);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const body: Partial<Booking> = { ...form, year: form.year ? Number(form.year) : undefined };
      await api("/bookings", { method: "POST", body: JSON.stringify(body) });
      setForm(empty);
      setStatus("done");
    } catch {
      setStatus("error");
    }
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
          {status === "done" && <p className="msg-ok" role="status">Booking received. We will confirm by SMS or WhatsApp.</p>}
          {status === "error" && <p className="msg-err" role="alert">Something went wrong. Please try again.</p>}
        </form>
      </section>
    </main>
  );
}
