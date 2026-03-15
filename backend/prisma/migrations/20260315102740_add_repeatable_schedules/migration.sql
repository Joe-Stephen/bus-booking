-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "isPaused" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "repeatType" INTEGER NOT NULL DEFAULT 1;
