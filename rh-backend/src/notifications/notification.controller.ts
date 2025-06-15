import { Controller, Get, UseGuards, Request, Patch, Param } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
    constructor(private prisma: PrismaService) {}

    @Get()
    async findAllForUser(@Request() req) {
        const userId = req.user.sub;
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    @Patch(':id/read')
    async markAsRead(@Request() req, @Param('id') id: string) {
        const userId = req.user.sub;
        
        // Ensure user can only mark their own notifications as read
        return this.prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true },
        });
    }

    @Patch('read-all')
    async markAllAsRead(@Request() req) {
        const userId = req.user.sub;
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
}