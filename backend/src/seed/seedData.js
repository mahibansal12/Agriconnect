// src/seed/seedData.js

import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import dns from "dns";
import { DB_NAME } from "../constants.js";

import { CropKnowledge } from "../models/cropKnowledge.model.js";
import { Pest } from "../models/pest.model.js";
import { Scheme } from "../models/scheme.model.js";

dotenv.config();

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const crops = JSON.parse(fs.readFileSync("./src/data/crops.json", "utf-8"));
const pests = JSON.parse(fs.readFileSync("./src/data/pests.json", "utf-8"));
const schemes = JSON.parse(fs.readFileSync("./src/data/schemes.json", "utf-8"));

const seedDatabase = async () => {
    try {
        
        console.log("MONGO_URI =", process.env.MONGO_URI);
        console.log("DB_NAME =", DB_NAME);
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: DB_NAME,
            serverSelectionTimeoutMS: 30000,
        });
        console.log("MongoDB connected for seeding...");

       
        await CropKnowledge.deleteMany();
        await Pest.deleteMany();
        await Scheme.deleteMany();
        console.log("Old data cleared");

       
        await CropKnowledge.insertMany(crops);
        console.log(`${crops.length} crops inserted`);

        await Pest.insertMany(pests);
        console.log(`${pests.length} pests inserted`);

        await Scheme.insertMany(schemes);
        console.log(`${schemes.length} schemes inserted`);

        console.log("Database seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedDatabase();