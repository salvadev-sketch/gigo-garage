import { createHash } from "node:crypto";

/** Photos are uploaded straight from the browser to Cloudinary with a signature made here, so the API secret never leaves the server. */
export const UPLOAD_FOLDER = "gigo-garage/parts";
export const ALLOWED_FORMATS = "jpg,jpeg,png,webp";

export const cloudinaryConfig = () => {
  const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: apiSecret } = process.env;
  return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null;
};

/** Cloudinary signature: SHA-1 of the sorted "key=value" pairs joined by "&", with the API secret appended. */
export const sign = (params: Record<string, string | number>, apiSecret: string) =>
  createHash("sha1")
    .update(Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&") + apiSecret)
    .digest("hex");

/** Only images from our own Cloudinary account are accepted as a part photo, never an arbitrary web address. */
export const isOurImage = (url: string) => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  return !!name && url.startsWith(`https://res.cloudinary.com/${name}/image/upload/`);
};

/** "https://res.cloudinary.com/x/image/upload/v123/gigo-garage/parts/abc.jpg" -> "gigo-garage/parts/abc". Only our own upload folder is ever deleted. */
export const publicIdOf = (url: string) => {
  const id = url.match(/\/image\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i)?.[1];
  return id && id.startsWith(`${UPLOAD_FOLDER}/`) ? id : null;
};

/** Deletes a photo from Cloudinary. Best effort: a failure is logged and never blocks the request that triggered it. */
export async function destroyImage(url: string): Promise<void> {
  const c = cloudinaryConfig();
  const publicId = isOurImage(url) ? publicIdOf(url) : null;
  if (!c || !publicId) return;
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const body = new URLSearchParams({
      public_id: publicId, timestamp: String(timestamp), api_key: c.apiKey, signature: sign({ public_id: publicId, timestamp }, c.apiSecret),
    });
    const res = await fetch(`https://api.cloudinary.com/v1_1/${c.cloudName}/image/destroy`, { method: "POST", body });
    if (!res.ok) console.error(`Cloudinary delete failed (${res.status}) for ${publicId}`);
  } catch (e) {
    console.error("Cloudinary delete failed:", e instanceof Error ? e.message : e);
  }
}
