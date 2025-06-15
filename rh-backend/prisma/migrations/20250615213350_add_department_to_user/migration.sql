-- CreateEnum
CREATE TYPE "Department" AS ENUM ('HR', 'IT', 'Business', 'Management');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "department" "Department" NOT NULL DEFAULT 'Business';
