/*
  Warnings:

  - You are about to drop the column `name` on the `Position` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Position_name_key";

-- AlterTable
ALTER TABLE "Position" DROP COLUMN "name",
ADD COLUMN     "defaultName" TEXT;

-- CreateTable
CREATE TABLE "PositionTranslation" (
    "id" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "translatedName" TEXT NOT NULL,

    CONSTRAINT "PositionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PositionTranslation_positionId_languageCode_key" ON "PositionTranslation"("positionId", "languageCode");

-- AddForeignKey
ALTER TABLE "PositionTranslation" ADD CONSTRAINT "PositionTranslation_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;
