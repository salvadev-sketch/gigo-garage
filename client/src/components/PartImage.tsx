import { resized } from "../cloudinary";
import type { Part } from "../../../shared/types";

/** The part's photo, or the grey placeholder until one is uploaded. Size and shape come from the surrounding CSS class. */
export default function PartImage({ part, width, className = "" }: { part: Pick<Part, "name" | "imageUrl">; width: number; className?: string }) {
  return (
    <div className={`ph ${className}`}>
      {part.imageUrl ? <img src={resized(part.imageUrl, width)} alt={part.name} loading="lazy" /> : "[PHOTO]"}
    </div>
  );
}
