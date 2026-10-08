import "dotenv/config";
import { isStaffRole, ROLES } from "../../shared/roles.js";
import { firebaseAuth } from "./firebase.js";

// Usage: npm run set-role -- you@example.com owner   (use "none" to remove the role)
// Needed once to create the first owner; after that the owner can use POST /api/admin/roles.
const [email, roleArg] = process.argv.slice(2);
const role = roleArg === "none" ? null : roleArg;
if (!email || (role !== null && !isStaffRole(role))) {
  console.error(`Usage: npm run set-role -- <email> <${ROLES.join("|")}|none>`);
  process.exit(1);
}

const auth = firebaseAuth();
const user = await auth.getUserByEmail(email);
await auth.setCustomUserClaims(user.uid, { ...user.customClaims, role });
await auth.revokeRefreshTokens(user.uid);
console.log(`${email} -> ${role ?? "no role"}. They must sign in again.`);
