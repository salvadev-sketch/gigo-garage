// Empty in dev (Vite proxies /api). In production set VITE_API_URL to the server, e.g. https://gigo-garage-api.onrender.com
const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers as Record<string, string> | undefined) },
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}
