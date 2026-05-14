/*
  Warnings:

  - You are about to drop the column `acceptInvite` on the `ProjectUser` table. All the data in the column will be lost.
  - You are about to drop the column `inviteExpiry` on the `ProjectUser` table. All the data in the column will be lost.
  - You are about to drop the column `inviteToken` on the `ProjectUser` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ProjectUser_inviteToken_key";

-- AlterTable
ALTER TABLE "ProjectUser" DROP COLUMN "acceptInvite",
DROP COLUMN "inviteExpiry",
DROP COLUMN "inviteToken";

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "inviteToken" TEXT,
    "inviteExpiry" TIMESTAMP(3),
    "acceptInvite" BOOLEAN NOT NULL DEFAULT false,
    "invitedById" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "invitedUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_inviteToken_key" ON "Invitation"("inviteToken");

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
