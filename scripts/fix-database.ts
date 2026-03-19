import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://eventease_admin:EventEase2026@cluster0.9ygulok.mongodb.net/eventease?retryWrites=true&w=majority";

type MongoError = {
  code?: number;
  message?: string;
};

async function fixDatabase() {
  try {
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
