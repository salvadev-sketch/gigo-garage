import { api } from "./api";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

interface Signed { cloudName: string; apiKey: string; timestamp: number; folder: string; allowed_formats: string; signature: string }

/** Uploads one photo straight to Cloudinary using a signature from our server. Returns the image URL to store on the part. */
export async function uploadPartPhoto(file: File, headers: Record<string, string>): Promise<string> {
  if (!TYPES.includes(file.type)) throw new Error("Use a JPG, PNG or WebP photo.");
  if (file.size > MAX_BYTES) throw new Error("Photo is too large (max 5 MB).");
  const s = await api<Signed>("/admin/uploads/sign", { method: "POST", headers });
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", s.apiKey);
  form.append("timestamp", String(s.timestamp));
  form.append("folder", s.folder);
  form.append("allowed_formats", s.allowed_formats);
  form.append("signature", s.signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${s.cloudName}/image/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Upload failed. Try again.");
  const out = (await res.json()) as { secure_url?: string };
  if (!out.secure_url) throw new Error("Upload failed. Try again.");
  return out.secure_url;
}

/** Smaller, optimised version of a Cloudinary image (right format and quality for each browser). */
export const resized = (url: string, width: number) => url.replace("/image/upload/", `/image/upload/f_auto,q_auto,c_limit,w_${width}/`);
