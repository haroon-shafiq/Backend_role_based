/*
  Warnings:

  - You are about to drop the column `changedField` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `newValue` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `oldValue` on the `Activity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "changedField",
DROP COLUMN "newValue",
DROP COLUMN "oldValue",
ADD COLUMN     "changedFields" TEXT[],
ADD COLUMN     "newValues" TEXT[],
ADD COLUMN     "oldValues" TEXT[];
