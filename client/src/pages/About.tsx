import { Link } from "react-router-dom";
import { site } from "../siteInfo";

const what = [
  { title: "Spare parts shop", text: "EV and hybrid parts for the cars on our roads, matched to your make, model and year.", to: "/shop", cta: "Browse parts" },
  { title: "Garage", text: "Book a service, get a Car ID and follow the waiting list while your car is being repaired.", to: "/garage", cta: "Book a service" },
  { title: "Order from China", text: "Part not in stock? We send you a quote, order it and let you track it until it arrives.", to: "/china", cta: "Request a part" },
];

export default function About() {
  return (
    <main className="container">
      <section className="about-hero">
        <p className="eyebrow">About us</p>
        <h1>EV and hybrid parts and garage services for Burundi.</h1>
        <p>
          {site.name} brings an electric and hybrid vehicle garage and a spare parts shop together in one place,
          starting with the cars most common in East Africa. You can find the right part, book a repair,
          or order what we do not have in stock from China.
        </p>
      </section>

      <section className="section">
        <div className="title"><h2>What we do</h2><div /></div>
        <div className="grid3">
          {what.map((w) => (
            <div className="service" key={w.title}>
              <b>{w.title}</b>
              <span>{w.text}</span>
              <Link to={w.to} className="btn btn-outline" style={{ alignSelf: "flex-start" }}>{w.cta}</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="built">
        <h2>Built by {site.owner}</h2>
        <p>
          {site.owner} is a Full Stack Developer with a Bachelor of Science in Computer Science, focused on building
          production-ready web applications for the Rwandan market.
        </p>
        <p>
          This site uses the MERN stack with TypeScript: MongoDB, Express, React and Node.js. Frontends are deployed on
          Vercel and backends on Render, with MongoDB Atlas for data.
        </p>
        <Link to="/contact" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>Get in touch</Link>
      </section>
    </main>
  );
}
