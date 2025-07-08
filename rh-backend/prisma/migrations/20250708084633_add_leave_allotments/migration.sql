-- AlterTable
ALTER TABLE "User" ADD COLUMN     "personalLeaveAllotment" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "sickLeaveAllotment" INTEGER NOT NULL DEFAULT 12;
