// Empty in dev (Vite proxies /api). In production set VITE_API_URL to the server, e.g. https://gigo-garage-api.onrender.com
const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers as Record<string, string> | undefined) },
  });
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try { const b = await res.json(); if (typeof b?.error === "string") message = b.error; } catch { /* no JSON body */ }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}
