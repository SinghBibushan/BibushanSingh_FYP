// Script to drop the problematic googleId index and reseed database
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://eventease_admin:EventEase2026@cluster0.9ygulok.mongodb.net/eventease?retryWrites=true&w=majority";

async function fixDatabase() {
  try {
    console.log("🔧 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);

    console.log("✅ Connected!");

    // Drop the problematic index
    console.log("🗑️  Dropping old googleId index...");
    try {
      if (mongoose.connection.db) {
        await mongoose.connection.db.collection("users").dropIndex("googleId_1");
        console.log("✅ Old index dropped!");
      }
    } catch (error: any) {
      if (error.code === 27) {
        console.log("ℹ️  Index doesn't exist, skipping...");
      } else {
        console.log("⚠️  Error dropping index:", error.message);
      }
    }

    // Clear all collections
    console.log("🗑️  Clearing all collections...");
    if (!mongoose.connection.db) {
      throw new Error("Database connection not established");
    }
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
      console.log(`   ✓ Cleared ${collection.collectionName}`);
    }

    console.log("✅ Database cleared!");
    console.log("📝 Now run: npm run db:seed");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixDatabase();
