// src/scripts/seedShops.js
// Run: node --env-file .env src/scripts/seedShops.js

import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import { DB_NAME } from "../constants.js";
import { Shop } from "../models/shop.model.js";

dotenv.config();

const shops = JSON.parse(fs.readFileSync("./src/data/shops.json", "utf-8"));

const seedShops = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: DB_NAME,
            serverSelectionTimeoutMS: 30000,
        });
        console.log("MongoDB connected for shop seeding…");

        // Clear existing seeded shops (keep admin-created ones)
        const deleted = await Shop.deleteMany({});
        console.log(`Cleared ${deleted.deletedCount} existing shops`);

        // Transform flat lat/lng into GeoJSON location
        const shopDocs = shops.map((s) => ({
            name: s.name,
            ownerName: s.ownerName,
            phone: s.phone,
            address: s.address,
            state: s.state,
            district: s.district,
            category: s.category,
            location: {
                type: "Point",
                coordinates: [parseFloat(s.longitude), parseFloat(s.latitude)],
            },
        }));

        await Shop.insertMany(shopDocs);
        console.log(`✅ ${shopDocs.length} shops seeded successfully!`);

        // Verify the 2dsphere index exists
        await Shop.collection.createIndex({ location: "2dsphere" });
        console.log("✅ 2dsphere index ensured");

        process.exit(0);
    } catch (err) {
        console.error("❌ Shop seeding failed:", err);
        process.exit(1);
    }
};

seedShops();
