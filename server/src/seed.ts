import "dotenv/config";
import mongoose from "mongoose";
import { Part } from "./models/index.js";

// SAMPLE DATA ONLY: replace names, part numbers and prices with real stock.
const sample = [
  { name: "Front brake pads", category: "Brakes", partNo: "SAMPLE-001", make: "Toyota", model: "Prius", years: [2010, 2011, 2012, 2013], price: 45000, stock: 10, source: "shop" },
  { name: "Oil filter", category: "Filters & fluids", partNo: "SAMPLE-002", make: "Toyota", model: "Corolla", years: [2009, 2010, 2011], price: 12000, stock: 25, source: "shop" },
  { name: "Front shock absorber", category: "Suspension", partNo: "SAMPLE-003", make: "Honda", model: "Fit", years: [2012, 2013, 2014], price: 85000, stock: 6, source: "shop" },
  { name: "Cabin air filter", category: "Filters & fluids", partNo: "SAMPLE-004", make: "Nissan", model: "Leaf", years: [2014, 2015, 2016], price: 18000, stock: 12, source: "shop" },
  { name: "Hybrid battery module", category: "Hybrid & EV battery", partNo: "SAMPLE-005", make: "Toyota", model: "Prius", years: [2010, 2011, 2012, 2013], price: 350000, stock: 0, source: "china", leadTimeWeeks: 4 },
  { name: "Inverter coolant pump", category: "AC & cooling", partNo: "SAMPLE-006", make: "Toyota", model: "Prius", years: [2010, 2011, 2012], price: 120000, stock: 0, source: "china", leadTimeWeeks: 3 },
  { name: "Charging port assembly", category: "Electrical & sensors", partNo: "SAMPLE-007", make: "Nissan", model: "Leaf", years: [2014, 2015, 2016], price: 140000, stock: 0, source: "china", leadTimeWeeks: 4 },
];

await mongoose.connect(process.env.MONGODB_URI as string);
await Part.deleteMany({ partNo: /^SAMPLE-/ });
await Part.insertMany(sample);
console.log(`Seeded ${sample.length} sample parts`);
await mongoose.disconnect();
