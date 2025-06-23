-- CreateEnum
CREATE TYPE "ApproverType" AS ENUM ('EMPLOYEE', 'TEAM_LEADER', 'MANAGER', 'HR', 'DHR');

-- AlterTable
ALTER TABLE "LeaveRequest" ADD COLUMN     "currentApproverId" TEXT,
ADD COLUMN     "overallStatus" "LeaveStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "managerId" TEXT,
ADD COLUMN     "teamLeaderId" TEXT;

-- CreateTable
CREATE TABLE "LeaveApproval" (
    "id" TEXT NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "step" INTEGER NOT NULL,
    "leaveRequestId" TEXT NOT NULL,
    "approverId" TEXT,
    "approverType" "ApproverType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveApproval_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamLeaderId_fkey" FOREIGN KEY ("teamLeaderId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LeaveApproval" ADD CONSTRAINT "LeaveApproval_leaveRequestId_fkey" FOREIGN KEY ("leaveRequestId") REFERENCES "LeaveRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveApproval" ADD CONSTRAINT "LeaveApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
