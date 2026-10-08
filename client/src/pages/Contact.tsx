import { FormEvent, useState } from "react";
import { site } from "../siteInfo";

const icon = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "#0B6B4F", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export default function Contact() {
  const [f, setF] = useState({ name: "", email: "", message: "" });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));

  // No backend needed: opens the visitor's email app with the message filled in.
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`${site.name} message from ${f.name || "a visitor"}`);
    const body = encodeURIComponent(`${f.message}\n\n— ${f.name} (${f.email})`);
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setF({ name: "", email: "", message: "" });
  };

  return (
    <main className="container" style={{ paddingBottom: 96 }}>
      <section className="about-hero" style={{ paddingBottom: 32 }}>
        <p className="eyebrow">Contact</p>
        <h1>Talk to us.</h1>
        <p>Have a question about a part, a repair or an order? Reach out directly or send a message below.</p>
      </section>
      <div className="book" style={{ paddingBottom: 0 }}>
        <div className="book-info">
          <h2 style={{ fontSize: 28 }}>Reach us directly</h2>
          <div className="contact-list">
            <a href={`mailto:${site.email}`}>
              <svg {...icon} aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>{site.email}
            </a>
            <a href={site.whatsappLink} target="_blank" rel="noopener noreferrer">
              <svg {...icon} aria-hidden="true"><path d="M4 20l1.3-4.2A8 8 0 1 1 8.4 18.8z" /></svg>WhatsApp {site.whatsappDisplay}
            </a>
            <a href={site.github} target="_blank" rel="noopener noreferrer">
              <svg {...icon} aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>{site.githubLabel}
            </a>
          </div>
          <p style={{ lineHeight: 1.9, color: "var(--ink)", fontSize: 16, marginTop: 24 }}>
            <b>Opening hours</b><br />[OPENING HOURS]<br /><br /><b>Location</b><br />[YOUR ADDRESS]
          </p>
        </div>
        <form className="form-card" onSubmit={submit}>
          <label className="field">Your name<input required value={f.name} onChange={set("name")} /></label>
          <label className="field">Your email<input required type="email" value={f.email} onChange={set("email")} /></label>
          <label className="field">Message<textarea required rows={6} value={f.message} onChange={set("message")} /></label>
          <button className="btn btn-primary" type="submit">Send message</button>
        </form>
      </div>
    </main>
  );
}
