import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { api } from "../api";

export type Role = "shop" | "garage";
export interface AdminCtx { headers: Record<string, string>; signOut: () => void }

/** Asks for the dashboard key, checks it with the server, then renders the dashboard. */
export default function AdminGate({ role, title, children }: { role: Role; title: string; children: (admin: AdminCtx) => ReactNode }) {
  const storeKey = `gigo-admin-${role}`;
  const [key, setKey] = useState(() => sessionStorage.getItem(storeKey) ?? "");
  const [input, setInput] = useState("");
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  const signOut = () => { sessionStorage.removeItem(storeKey); setKey(""); setOk(false); };
  const admin = useMemo<AdminCtx>(() => ({ headers: { "x-admin-key": key }, signOut }), [key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!key) return;
    api(`/admin/${role}/ping`, { headers: { "x-admin-key": key } })
      .then(() => { setOk(true); setError(""); })
      .catch(() => { signOut(); setError("Wrong key or server unavailable."); });
  }, [key, role]); // eslint-disable-line react-hooks/exhaustive-deps

  const login = (e: FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem(storeKey, input);
    setKey(input);
    setInput("");
  };

  if (key && ok) return <>{children(admin)}</>;
  if (key) return <main className="container"><p className="empty" style={{ marginTop: 32 }}>Checking key...</p></main>;
  return (
    <main className="container" style={{ padding: "56px 24px 96px", maxWidth: 520 }}>
      <h1 style={{ fontSize: 36 }}>{title}</h1>
      <form className="card-gray" onSubmit={login}>
        <label className="field">Dashboard key<input type="password" required value={input} onChange={(e) => setInput(e.target.value)} /></label>
        <button className="btn btn-primary" type="submit">Sign in</button>
        {error && <p className="msg-err" role="alert">{error}</p>}
      </form>
    </main>
  );
}
