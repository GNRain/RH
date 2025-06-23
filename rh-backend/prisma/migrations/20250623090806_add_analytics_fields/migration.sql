/*
  Warnings:

  - You are about to drop the column `leaveAllowance` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('VACATION', 'SICK_LEAVE', 'PERSONAL');

-- AlterTable
ALTER TABLE "LeaveRequest" ADD COLUMN     "type" "LeaveType" NOT NULL DEFAULT 'VACATION';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "leaveAllowance",
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "terminationDate" TIMESTAMP(3);
