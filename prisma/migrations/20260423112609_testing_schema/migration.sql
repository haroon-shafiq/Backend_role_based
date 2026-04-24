/*
  Warnings:

  - Added the required column `userType` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MANAGER', 'DEVELOPER', 'QA');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userType" "Role" NOT NULL;
