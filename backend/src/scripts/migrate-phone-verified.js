// backend/src/scripts/migrate-phone-verified.js
//
// One-time migration: the isPhoneVerified field is new. Mongoose applies
// its `default: false` to every existing document that doesn't have the
// field yet — which means every account created BEFORE this feature
// shipped would otherwise be forced through an OTP screen on next login,
// even though they never signed up expecting phone verification.
//
// This grandfathers in all pre-existing accounts by explicitly marking
// them verified. Only accounts created AFTER this migration runs will go
// through the real OTP flow.
//
// Run once, from the backend/ folder:
//   node src/scripts/migrate-phone-verified.js
//
// Safe to run more than once — it only touches documents that don't
// already have the field set.

import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import { DB_NAME } from "../constants.js";

dotenv.config();

// Node's DNS resolver (c-ares) sometimes fails to resolve the SRV record
// mongodb+srv:// needs, even when the OS resolver (nslookup) works fine —
// a known issue on Windows, especially behind college/VPN networks with
// unusual DNS setups. Forcing a public resolver fixes it reliably.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function run() {
    const uri = `${process.env.MONGO_URI}/${DB_NAME}`;
    await mongoose.connect(uri);
    console.log("Connected to DB:", mongoose.connection.name);

    const result = await mongoose.connection.collection("users").updateMany(
        { isPhoneVerified: { $exists: false } },
        { $set: { isPhoneVerified: true } }
    );

    console.log(`Grandfathered ${result.modifiedCount} existing account(s) as phone-verified.`);

    await mongoose.disconnect();
    process.exit(0);
}

run().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});