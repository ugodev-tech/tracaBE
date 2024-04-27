/*
  Warnings:

  - You are about to drop the column `name` on the `Token` table. All the data in the column will be lost.
  - Added the required column `nextOfKind` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Token" DROP COLUMN "name";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "nextOfKind" TEXT NOT NULL;
