// src/notifications/notification.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async createForUser(userId: string, message: string) {
    return this.prisma.notification.create({
      data: { userId, message },
    });
  }

  // --- FIX: This now accepts a department NAME (string) ---
  async createForDepartment(departmentName: string, message: string) {
    const usersInDept = await this.prisma.user.findMany({
      where: {
        department: {
          name: departmentName,
        },
      },
    });

    if (usersInDept.length === 0) return;

    const notifications = usersInDept.map((user) => ({
      userId: user.id,
      message,
    }));

    return this.prisma.notification.createMany({
      data: notifications,
    });
  }
}