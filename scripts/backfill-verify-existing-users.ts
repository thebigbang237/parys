// scripts/backfill-verify-existing-users.ts
//
// One-time grandfathering: mark every user that existed before email
// verification was introduced as verified, so nobody already using the
// platform gets locked out. Only run this once, right when the feature ships.
import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const result = await prisma.user.updateMany({
    where: { emailVerified: null },
    data: { emailVerified: new Date() },
  });

  console.log(`Marked ${result.count} existing user(s) as verified.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
