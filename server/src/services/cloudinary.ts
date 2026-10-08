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
