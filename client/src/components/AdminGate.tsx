import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { onIdTokenChanged, signInWithEmailAndPassword, signOut as fbSignOut } from "firebase/auth";
import { auth } from "../firebase";
import { DASHBOARD_ROLES, isStaffRole, StaffRole } from "../../../shared/roles";

export type Dashboard = keyof typeof DASHBOARD_ROLES;
export interface AdminCtx { headers: Record<string, string>; role: StaffRole; signOut: () => void }

type Session = { token: string; role: StaffRole } | "loading" | "none" | "forbidden";

/** Firebase sign-in for staff. Shows the dashboard only if the account's role may open it. */
export default function AdminGate({ role, title, children }: { role: Dashboard; title: string; children: (admin: AdminCtx) => ReactNode }) {
  const [session, setSession] = useState<Session>("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Fires on sign-in, sign-out and each hourly token refresh, so the Bearer token never goes stale.
  useEffect(() => onIdTokenChanged(auth, async (user) => {
    if (!user) return setSession("none");
    const result = await user.getIdTokenResult();
    const userRole = result.claims.role;
    const allowed = isStaffRole(userRole) && (DASHBOARD_ROLES[role] as readonly string[]).includes(userRole);
    setSession(allowed ? { token: result.token, role: userRole as StaffRole } : "forbidden");
  }), [role]);

  const signOut = () => { void fbSignOut(auth); };
  const admin = useMemo<AdminCtx | null>(
    () => (typeof session === "object" ? { headers: { Authorization: `Bearer ${session.token}` }, role: session.role, signOut } : null),
    [session],
  );

  const login = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try { await signInWithEmailAndPassword(auth, email, password); setPassword(""); }
    catch { setError("Wrong email or password."); }
  };

  if (admin) return <>{children(admin)}</>;
  if (session === "loading") return <main className="container"><p className="empty" style={{ marginTop: 32 }}>Loading...</p></main>;
  if (session === "forbidden") {
    return (
      <main className="container" style={{ padding: "56px 24px 96px", maxWidth: 520 }}>
        <h1 style={{ fontSize: 36 }}>{title}</h1>
        <p className="msg-err" role="alert">Your account does not have access to this dashboard.</p>
        <button className="btn btn-outline" onClick={signOut}>Sign out</button>
      </main>
    );
  }
  return (
    <main className="container" style={{ padding: "56px 24px 96px", maxWidth: 520 }}>
      <h1 style={{ fontSize: 36 }}>{title}</h1>
      <form className="card-gray" onSubmit={login}>
        <label className="field">Email<input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="field">Password<input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button className="btn btn-primary" type="submit">Sign in</button>
        {error && <p className="msg-err" role="alert">{error}</p>}
      </form>
    </main>
  );
}
