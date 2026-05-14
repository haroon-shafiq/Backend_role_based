/*
  Warnings:

  - You are about to drop the column `inviteStatus` on the `ProjectUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProjectUser" DROP COLUMN "inviteStatus",
ADD COLUMN     "acceptInvite" BOOLEAN NOT NULL DEFAULT false;
