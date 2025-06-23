import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role, LeaveType } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getHrDashboardData() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const [
      activeUsers, allUsers, acceptedLeaveRequests, pendingLeaveRequests
    ] = await Promise.all([
      this.prisma.user.findMany({ where: { status: 'ACTIVE' }, select: { joinDate: true, birthDate: true, gender: true } }),
      this.prisma.user.findMany({ select: { joinDate: true, terminationDate: true } }),
      this.prisma.leaveRequest.findMany({ where: { overallStatus: 'ACCEPTED' }, include: { user: { include: { department: true } } } }),
      this.prisma.leaveRequest.count({ where: { overallStatus: 'PENDING' } }),
    ]);

    const totalActiveEmployees = activeUsers.length;
    const newHiresThisMonth = allUsers.filter(u => new Date(u.joinDate) >= startOfMonth).length;

    const leaveDaysByDept = acceptedLeaveRequests.reduce((acc, req) => {
        const deptName = req.user.department.name;
        const duration = (req.toDate.getTime() - req.fromDate.getTime()) / (1000 * 3600 * 24) + 1;
        acc[deptName] = (acc[deptName] || 0) + Math.round(duration);
        return acc;
    }, {} as Record<string, number>);
    
    const leaveTypeBreakdown = acceptedLeaveRequests.reduce((acc, req) => {
        acc[req.type] = (acc[req.type] || 0) + 1;
        return acc;
    }, {} as Record<LeaveType, number>);

    let totalTenureInDays = 0;
    const ageBuckets: Record<string, number> = { '20-29': 0, '30-39': 0, '40-49': 0, '50-59': 0, '60+': 0 };
    const genderRatio: Record<string, number> = {};

    activeUsers.forEach(user => {
        totalTenureInDays += (today.getTime() - new Date(user.joinDate).getTime()) / (1000 * 3600 * 24);
        if(user.birthDate) {
            const age = today.getFullYear() - new Date(user.birthDate).getFullYear();
            if (age <= 29) ageBuckets['20-29']++;
            else if (age <= 39) ageBuckets['30-39']++;
            else if (age <= 49) ageBuckets['40-49']++;
            else if (age <= 59) ageBuckets['50-59']++;
            else ageBuckets['60+']++;
        }
        if(user.gender) genderRatio[user.gender] = (genderRatio[user.gender] || 0) + 1;
    });
    const averageTenureYears = activeUsers.length > 0 ? (totalTenureInDays / activeUsers.length / 365).toFixed(1) : 0;

    const headcountTrend: { name: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        const monthName = d.toLocaleString('default', { month: 'short' });
        const count = allUsers.filter(u => new Date(u.joinDate) <= monthEnd && (!u.terminationDate || new Date(u.terminationDate) > monthEnd)).length;
        headcountTrend.push({ name: monthName, count });
    }

    // This query was missing from the Promise.all, let's add it back for the chart
    const departmentsWithCounts = await this.prisma.department.findMany({
        include: { _count: { select: { users: { where: { status: 'ACTIVE' } } } } },
    });
    const employeesByDept = departmentsWithCounts.map(d => ({ name: d.name, count: d._count.users }));

    return {
      totalActiveEmployees,
      pendingLeaveRequests,
      newHiresThisMonth,
      employeesByDept, // Now included
      leaveDaysByDept: Object.entries(leaveDaysByDept).map(([name, count]) => ({ name, count })),
      leaveTypeBreakdown: Object.entries(leaveTypeBreakdown).map(([name, count]) => ({ name, count })),
      averageTenureYears,
      ageDistribution: Object.entries(ageBuckets).map(([name, count]) => ({ name, count })),
      genderRatio: Object.entries(genderRatio).map(([name, count]) => ({ name, count })),
      headcountTrend,
    };
  }
}