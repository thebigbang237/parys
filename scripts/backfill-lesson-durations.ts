// scripts/backfill-lesson-durations.ts
import "dotenv/config";
import { prisma } from "../lib/prisma";
import { getVideoDetails } from "../lib/services/stream.service";

async function main() {
  const lessons = await prisma.lesson.findMany({
    where: {
      cloudflare_video_id: { not: null },
      duration_seconds: null,
    },
    select: { id: true, title: true, cloudflare_video_id: true },
  });

  console.log(`Found ${lessons.length} lesson(s) missing duration_seconds.\n`);

  let updated = 0;
  let skipped = 0;

  for (const lesson of lessons) {
    try {
      const details = await getVideoDetails(lesson.cloudflare_video_id!);

      if (
        !details.readyToStream ||
        typeof details.duration !== "number" ||
        details.duration <= 0
      ) {
        console.log(
          `⏭  Skipping "${lesson.title}" — not ready yet (readyToStream=${details.readyToStream}, duration=${details.duration})`,
        );
        skipped++;
        continue;
      }

      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { duration_seconds: Math.round(details.duration) },
      });

      console.log(`✅ "${lesson.title}" → ${Math.round(details.duration)}s`);
      updated++;
    } catch (err) {
      console.error(`❌ Failed for "${lesson.title}":`, err);
      skipped++;
    }
  }

  console.log(`\nDone. Updated ${updated}, skipped ${skipped}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
