import fs from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "public", "images");
const EXTS = ["jpg", "jpeg", "png", "webp", "avif"];

/**
 * Returns the public URL of /public/images/<name>.<ext> if the file exists,
 * otherwise null. Looks up by name, e.g. "deluxe", "hero", "deluxe-2".
 */
export function findImage(name) {
  for (const ext of EXTS) {
    const file = path.join(DIR, `${name}.${ext}`);
    if (fs.existsSync(file)) {
      const v = Math.round(fs.statSync(file).mtimeMs);
      return `/images/${name}.${ext}?v=${v}`;
    }
  }
  return null;
}

/** All gallery images for a room: <slug>.ext, <slug>-2.ext, <slug>-3.ext ... */
export function findGallery(slug, max = 6) {
  const out = [];
  const main = findImage(slug);
  if (main) out.push(main);
  for (let i = 2; i <= max; i++) {
    const img = findImage(`${slug}-${i}`);
    if (img) out.push(img);
  }
  return out;
}
