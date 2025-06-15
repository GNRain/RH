import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Department } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  // Create a notification for a single user
  async createForUser(userId: string, message: string) {
    return this.prisma.notification.create({
      data: {
        userId,
        message,
      },
    });
  }

  // Create a notification for all users in a specific department
  async createForDepartment(department: Department, message: string) {
    const usersInDept = await this.prisma.user.findMany({
      where: { department },
    });

    const notifications = usersInDept.map((user) => ({
      userId: user.id,
      message,
    }));

    return this.prisma.notification.createMany({
      data: notifications,
    });
  }
}