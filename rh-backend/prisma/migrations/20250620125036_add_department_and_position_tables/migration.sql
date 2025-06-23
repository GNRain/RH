/*
  Warnings:

  - You are about to drop the column `department` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `User` table. All the data in the column will be lost.
  - Added the required column `departmentId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `positionId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "department",
DROP COLUMN "position",
ADD COLUMN     "departmentId" TEXT NOT NULL,
ADD COLUMN     "leaveAllowance" INTEGER NOT NULL DEFAULT 25,
ADD COLUMN     "positionId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Department";

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Position_name_key" ON "Position"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
