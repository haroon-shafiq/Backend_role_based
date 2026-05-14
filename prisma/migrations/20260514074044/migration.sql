/*
  Warnings:

  - You are about to drop the column `acceptInvite` on the `ProjectUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProjectUser" DROP COLUMN "acceptInvite",
ADD COLUMN     "inviteStatus" TEXT NOT NULL DEFAULT 'PENDING';
