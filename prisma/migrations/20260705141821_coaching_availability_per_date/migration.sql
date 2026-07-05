-- Coaching availability moves from a recurring day-of-week model to
-- specific calendar dates. Existing weekly rows don't map to real
-- dates, so they're cleared — availability needs to be re-entered
-- per date under the new admin calendar UI.
TRUNCATE TABLE "CoachingAvailability";

-- AlterTable
ALTER TABLE "CoachingAvailability" DROP COLUMN "day_of_week",
ADD COLUMN     "date" DATE NOT NULL;

-- DropTable
DROP TABLE "CoachingException";
