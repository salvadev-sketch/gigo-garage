import { FormEvent, useState } from "react";
import { api } from "../api";
import { bif } from "../format";
import { site } from "../siteInfo";
import type { ChinaStatus, ChinaTrack } from "../../../shared/types";

const flow: { id: ChinaStatus; text: string }[] = [
  { id: "requested", text: "Request received" },
  { id: "quoted", text: "Quote ready" },
  { id: "ordered", text: "Ordered from China" },
  { id: "shipped", text: "On the way" },
  { id: "arrived", text: "Arrived in Burundi" },
  { id: "ready", text: "Ready for you" },
];

/** Lets a customer follow a China request with the number they were given. */
export default function TrackRequest({ initial = "" }: { initial?: string }) {
  const [no, setNo] = useState(initial);
  const [found, setFound] = useState<ChinaTrack | "none" | null>(null);

  const check = async (e: FormEvent) => {
    e.preventDefault();
    try { setFound(await api<ChinaTrack>(`/china-requests/track/${encodeURIComponent(no.trim())}`)); } catch { setFound("none"); }
  };
  const idx = found && found !== "none" ? flow.findIndex((s) => s.id === found.status) : -1;

  return (
    <div>
      <form className="track" onSubmit={check}>
        <label><span style={{ position: "absolute", left: -9999 }}>Request number</span>
          <input placeholder="Request number, e.g. CN-0001" value={no} onChange={(e) => setNo(e.target.value)} />
        </label>
        <button className="btn btn-light" type="submit">Check</button>
      </form>
      {found === "none" && <p className="msg-err" role="alert">Request number not found.</p>}
      {found && found !== "none" && (
        <div className="card-gray">
          <b style={{ fontSize: 20 }}>{found.requestNo}</b>
          <span className="muted">{[found.partNo, found.vehicle].filter(Boolean).join(" · ")}</span>
          {found.quote !== undefined && (
            <p className="msg-ok" style={{ margin: 0 }}>
              Quote: {bif(found.quote)}{found.deposit !== undefined ? ` · Deposit to pay now: ${bif(found.deposit)}` : ""}.
              Pay by Lumicash or bank transfer and send us the reference on WhatsApp {site.whatsappDisplay}.
            </p>
          )}
          <ol className="steps">
            {flow.map((s, i) => <li key={s.id} className={i < idx ? "done" : i === idx ? "now" : ""}>{s.text}</li>)}
          </ol>
        </div>
      )}
    </div>
  );
}
