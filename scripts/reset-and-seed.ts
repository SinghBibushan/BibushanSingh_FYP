import {
  connectScriptDatabase,
  disconnectScriptDatabase,
  resetDatabase,
  seedDatabase,
} from "./seed-lib";

async function main() {
  await connectScriptDatabase();
  await resetDatabase();
  const credentials = await seedDatabase();

  console.log("Database reset and reseeded successfully.");
  console.log(`Demo admin: ${credentials.adminEmail} / ${credentials.adminPassword}`);
  console.log(`Demo user: ${credentials.userEmail} / ${credentials.userPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectScriptDatabase();
  });

export {};
