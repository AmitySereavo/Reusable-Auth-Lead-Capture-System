/*
  Warnings:

  - You are about to drop the column `emailOptIn` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `smsOptIn` on the `Lead` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "emailOptIn",
DROP COLUMN "smsOptIn",
ADD COLUMN     "updatesOptIn" BOOLEAN NOT NULL DEFAULT false;
