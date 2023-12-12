/*
  Warnings:

  - You are about to drop the column `rateTypeId` on the `EventDetails` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "EventDetails" DROP CONSTRAINT "EventDetails_rateTypeId_fkey";

-- AlterTable
ALTER TABLE "EventDetails" DROP COLUMN "rateTypeId";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "city" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "province" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "roles" "Role"[] DEFAULT ARRAY['user']::"Role"[];

-- CreateTable
CREATE TABLE "Inclusion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "preselect" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Inclusion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_InclusionToLeadForm" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Inclusion_name_key" ON "Inclusion"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_InclusionToLeadForm_AB_unique" ON "_InclusionToLeadForm"("A", "B");

-- CreateIndex
CREATE INDEX "_InclusionToLeadForm_B_index" ON "_InclusionToLeadForm"("B");

-- AddForeignKey
ALTER TABLE "LeadForm" ADD CONSTRAINT "LeadForm_rateTypeId_fkey" FOREIGN KEY ("rateTypeId") REFERENCES "RateType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InclusionToLeadForm" ADD CONSTRAINT "_InclusionToLeadForm_A_fkey" FOREIGN KEY ("A") REFERENCES "Inclusion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InclusionToLeadForm" ADD CONSTRAINT "_InclusionToLeadForm_B_fkey" FOREIGN KEY ("B") REFERENCES "LeadForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
