// test-prisma.ts
import {prisma} from './lib/prisma'

// Instantiate the client with query logging enabled to see the generated SQL Server execution
 

async function main() {
  console.log("🚀 Starting database read test...");

  // Execute the target query against your real SQL Server Report table
  // Equivalent to: SELECT * FROM Report WHERE Status = 'enable' ORDER BY Rank ASC
  const enabledReports = await prisma.report.findMany({
    where: {
      Status: "enable",
    },
    orderBy: {
      Rank: "asc",
    },
  });

  console.log(`\n✅ Query successful! Found ${enabledReports.length} matching reports.\n`);
  console.log("📋 Data Payload:");
  console.log(JSON.stringify(enabledReports, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Database test failed:");
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });