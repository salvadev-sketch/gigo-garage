import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { Part } from "../../../shared/types";

const featured = [
  { title: "EV & hybrid batteries", text: "Modules, packs and cooling parts for the cars on our roads." },
  { title: "Brakes & suspension", text: "Everyday wear parts, matched to your make and model." },
  { title: "Order from China", text: "Part not in stock? We quote, order and track it for you." },
];

function SectionTitle({ children }: { children: string }) {
  return <div className="title"><h2>{children}</h2><div /></div>;
}

export default function Home() {
  const [parts, setParts] = useState<Part[]>([]);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    api<Part[]>("/parts?source=shop").then((p) => setParts(p.slice(0, 4))).catch(() => setParts([]));
  }, []);

  const onSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true); // TODO: send to backend
  };

  return (
    <main>
      <section className="container">
        <div className="hero">
          <div className="hero-text">
            <p className="eyebrow">Limited time offer · [XX]% off</p>
            <h1>Hybrid battery modules, tested and ready to fit.</h1>
            <div className="row">
              <Link to="/shop" className="btn btn-primary">Buy now</Link>
              <Link to="/shop"><b>Find more →</b></Link>
            </div>
          </div>
          <div className="ph">[PHOTO]</div>
        </div>
        <div className="dots"><span className="on" /><span /><span /></div>
      </section>

      <section className="container section">
        <SectionTitle>Popular products</SectionTitle>
        <div className="grid4">
          {(parts.length ? parts : [null, null, null, null]).map((p, i) => (
            <div className="product" key={p?._id ?? i}>
              <div className="ph">[PHOTO]</div>
              <b>{p?.name ?? "Spare part"}</b>
              <small>{p ? `Fits ${p.make} ${p.model} · ${p.partNo}` : "Fits [MAKE] [MODEL] · [PART NO.]"}</small>
              <div className="foot">
                <b>{p ? `${p.price.toLocaleString()} BIF` : "[PRICE] BIF"}</b>
                <Link to="/shop" className="btn btn-outline">Buy now</Link>
              </div>
            </div>
          ))}
        </div>
        <div className="more"><Link to="/shop" className="btn btn-outline" style={{ padding: "12px 36px", fontSize: 16 }}>See more</Link></div>
      </section>

      <section className="container section">
        <SectionTitle>Featured products</SectionTitle>
        <div className="grid3">
          {featured.map((f) => (
            <div className="feature" key={f.title}>
              <span className="muted" style={{ fontSize: 14 }}>[PHOTO]</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
              <Link to="/shop" className="btn btn-primary">Buy now</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="banner">
          <div style={{ flex: "1 1 400px" }}>
            <h2>Can't find your part?</h2>
            <p>Send the part number or a photo. We order it from China and you track it until it arrives.</p>
            <Link to="/shop" className="btn btn-white">Order from China</Link>
          </div>
          <div className="ph">[PHOTO]</div>
        </div>
      </section>

      <section className="container subscribe">
        <h2>Get new part arrivals first</h2>
        <p className="muted" style={{ fontSize: 17, margin: 0 }}>Subscribe and we tell you when new EV and hybrid parts land.</p>
        {subscribed ? (
          <p style={{ marginTop: 28, fontWeight: 500 }}>Thank you, you are subscribed.</p>
        ) : (
          <form onSubmit={onSubscribe}>
            <label><span style={{ position: "absolute", left: -9999 }}>Email</span>
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <button className="btn btn-primary" type="submit">Subscribe</button>
          </form>
        )}
      </section>
    </main>
  );
}
