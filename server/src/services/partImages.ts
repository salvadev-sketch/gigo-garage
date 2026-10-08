import { Part } from "../models/index.js";
import { destroyImage } from "./cloudinary.js";

/** Removes a part's old photo from Cloudinary, unless another part still uses the same photo. */
export async function dropImage(url: string | undefined | null, partId: string): Promise<void> {
  if (!url) return;
  try {
    if (await Part.exists({ imageUrl: url, _id: { $ne: partId } })) return;
    await destroyImage(url);
  } catch (e) {
    console.error("Could not remove photo:", e instanceof Error ? e.message : e);
  }
}
