import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env") });

import mongoose from "mongoose";

async function testConnection() {
  const uri = process.env.MONGODB_URI;

  console.log("Testing MongoDB connection...");
  console.log("URI:", uri?.substring(0, 50) + "...");

  try {
    await mongoose.connect(uri!, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ MongoDB connected successfully!");
    console.log("Database:", mongoose.connection.db.databaseName);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ MongoDB connection failed:");
    console.error(error);
    process.exit(1);
  }
}

testConnection();
