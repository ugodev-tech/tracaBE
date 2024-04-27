/*
  Warnings:

  - You are about to drop the column `onboardSTage` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "onboardSTage",
ADD COLUMN     "onboardStage" INTEGER NOT NULL DEFAULT 0;
