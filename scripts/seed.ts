import {
  connectScriptDatabase,
  disconnectScriptDatabase,
  seedDatabase,
} from "./seed-lib";

async function main() {
  await connectScriptDatabase();
  const credentials = await seedDatabase();

  console.log("Database seeded successfully.");
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
