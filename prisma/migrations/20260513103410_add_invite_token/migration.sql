/*
  Warnings:

  - A unique constraint covering the columns `[inviteToken]` on the table `ProjectUser` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ProjectUser" ADD COLUMN     "inviteExpiry" TIMESTAMP(3),
ADD COLUMN     "inviteToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ProjectUser_inviteToken_key" ON "ProjectUser"("inviteToken");
