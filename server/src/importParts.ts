import "dotenv/config";
import { readFileSync } from "node:fs";
import mongoose from "mongoose";
import { Part } from "./models/index.js";
import { parseParts } from "./services/partsCsv.js";

// Usage: npm run import-parts -- data/parts.csv [--dry-run] [--update-stock]
// A part is matched by part number + make + model + source: existing parts are updated, new ones added.
// Stock of EXISTING parts is left alone (orders change it) unless you pass --update-stock.
const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const dryRun = args.includes("--dry-run");
const updateStock = args.includes("--update-stock");
if (!file) { console.error("Usage: npm run import-parts -- <file.csv> [--dry-run] [--update-stock]"); process.exit(1); }

const { rows, errors } = parseParts(readFileSync(file, "utf8"));
if (errors.length) {
  errors.forEach((e) => console.error(`Line ${e.line}: ${e.message}`));
  console.error(`${errors.length} problem(s). Nothing was imported. Fix the file and run again.`);
  process.exit(1);
}
console.log(`${rows.length} valid rows.`);
if (dryRun) { console.log("Dry run: nothing written."); process.exit(0); }

await mongoose.connect(process.env.MONGODB_URI as string);
const result = await Part.bulkWrite(rows.map(({ stock, ...all }) => {
  const fields = Object.fromEntries(Object.entries(all).filter(([, v]) => v !== undefined)) as typeof all; // blank cells keep what is already stored
  return {
  updateOne: {
    filter: { partNo: fields.partNo, make: fields.make, model: fields.model, source: fields.source },
    update: updateStock ? { $set: { ...fields, stock } } : { $set: fields, $setOnInsert: { stock } },
    upsert: true,
  },
  };
}));
console.log(`Added ${result.upsertedCount}, updated ${result.modifiedCount}.`);
await mongoose.disconnect();
