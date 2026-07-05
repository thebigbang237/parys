-- AlterTable
ALTER TABLE "CoachingBooking" ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Africa/Douala';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Africa/Douala';
