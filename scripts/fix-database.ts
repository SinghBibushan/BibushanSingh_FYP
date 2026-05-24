import mongoose from "mongoose";
import "dotenv/config";

const MONGODB_URI = process.env.MONGODB_URI;

type MongoError = {
  code?: number;
  message?: string;
};

async function fixDatabase() {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is required.");
    }

    if (process.env.CONFIRM_DATABASE_RESET !== "true") {
      throw new Error("Set CONFIRM_DATABASE_RESET=true to clear database collections.");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);

    console.log("Connected.");
    console.log("Dropping old googleId index...");

    try {
      if (mongoose.connection.db) {
        await mongoose.connection.db.collection("users").dropIndex("googleId_1");
        console.log("Old index dropped.");
      }
    } catch (error) {
      const mongoError = error as MongoError;
      if (mongoError.code === 27) {
        console.log("Index does not exist. Skipping.");
      } else {
        console.log("Error dropping index:", mongoError.message ?? error);
      }
    }

    console.log("Clearing all collections...");
    if (!mongoose.connection.db) {
      throw new Error("Database connection not established.");
    }

    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
      console.log(`Cleared ${collection.collectionName}`);
    }

    console.log("Database cleared.");
    console.log("Now run: npm run db:seed");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Database fix failed:", error);
    process.exit(1);
  }
}

void fixDatabase();
