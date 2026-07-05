/*
  Warnings:

  - You are about to drop the column `zoom_join_url` on the `CoachingBooking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CoachingBooking" DROP COLUMN "zoom_join_url",
ADD COLUMN     "meet_join_url" TEXT;
