import { FormEvent, useState } from "react";
import { api } from "../api";
import TrackRequest from "../components/TrackRequest";
import { site } from "../siteInfo";

const KEY = "gigo-china-request";
const makes = ["Toyota", "Nissan", "Honda", "Mitsubishi", "Suzuki", "Subaru", "Other"];
const blank = { partNo: "", make: "", model: "", year: "", notes: "", phone: "" };

export default function ChinaRequest() {
  const [f, setF] = useState(blank);
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [requestNo, setRequestNo] = useState(() => { try { return localStorage.getItem(KEY) ?? ""; } catch { return ""; } });
  const [justSent, setJustSent] = useState(false);
  const set = (k: keyof typeof blank) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState("sending");
    try {
      const vehicle = [f.make, f.model, f.year].filter(Boolean).join(" ");
      const res = await api<{ requestNo: string }>("/china-requests", {
        method: "POST",
        body: JSON.stringify({ partNo: f.partNo || undefined, vehicle, notes: f.notes || undefined, phone: f.phone }),
      });
      setRequestNo(res.requestNo);
      setJustSent(true);
      try { localStorage.setItem(KEY, res.requestNo); } catch { /* storage unavailable */ }
      setF(blank);
      setState("idle");
    } catch {
      setState("error");
    }
  };

  return (
    <main className="container" style={{ paddingBottom: 96 }}>
      <p className="crumb">Home / Order from China</p>
      <h1 style={{ margin: "0 0 12px", fontSize: 44 }}>Order a part from China</h1>
      <p className="muted" style={{ margin: "0 0 40px", fontSize: 17, maxWidth: 560, lineHeight: 1.5 }}>
        Can't find your part in the shop? Tell us what you need. We send you a quote, you pay a deposit, then you follow your order until it arrives.
      </p>
      <div className="book" style={{ paddingBottom: 0 }}>
        <form className="form-card" onSubmit={submit}>
          <label className="field">Part number (if you have it)<input value={f.partNo} onChange={set("partNo")} /></label>
          <div className="fields3">
            <label className="field">Make
              <select value={f.make} onChange={set("make")}><option value="">Select</option>{makes.map((m) => <option key={m}>{m}</option>)}</select>
            </label>
            <label className="field">Model<input value={f.model} onChange={set("model")} placeholder="e.g. Prius" /></label>
            <label className="field">Year<input type="number" min="1990" max="2100" value={f.year} onChange={set("year")} /></label>
          </div>
          <label className="field">Describe the part{f.partNo ? " (optional)" : ""}
            <textarea rows={3} required={!f.partNo} value={f.notes} onChange={set("notes")} placeholder="e.g. front left headlight, hybrid battery module" />
          </label>
          <label className="field">Phone / WhatsApp<input required type="tel" value={f.phone} onChange={set("phone")} /></label>
          <button className="btn btn-primary" type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending..." : "Request quote"}</button>
          {justSent && (
            <div className="msg-ok" role="status">
              Request received. Your request number:
              <span className="carid">{requestNo}</span>
              Keep it to follow your order. If you have a photo of the part, send it on WhatsApp {site.whatsappDisplay} with this number.
            </div>
          )}
          {state === "error" && <p className="msg-err" role="alert">Something went wrong. Please check your details and try again.</p>}
        </form>
        <div className="book-info" style={{ flex: "1 1 360px" }}>
          <h2 style={{ fontSize: 28 }}>Follow your request</h2>
          <TrackRequest key={requestNo} initial={requestNo} />
        </div>
      </div>
    </main>
  );
}
