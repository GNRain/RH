import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetScheduleDto } from './dto/get-schedule.dto';
import { BulkUpdateScheduleDto } from './dto/bulk-update-schedule.dto';
import { NotificationService } from 'src/notifications/notification.service';

@Injectable()
export class SchedulesService {
    constructor(
        private prisma: PrismaService,
        private notificationService: NotificationService
    ) {}

    findAll(query: GetScheduleDto) {
        return this.prisma.schedule.findMany({
            where: {
                date: {
                    gte: new Date(query.startDate),
                    lte: new Date(query.endDate),
                },
            },
            include: {
                department: { select: { id: true, name: true } },
                shift: { select: { id: true, name: true, startTime: true, endTime: true } },
            },
        });
    }

    async bulkUpdate(bulkUpdateDto: BulkUpdateScheduleDto) {
        const updates = bulkUpdateDto.updates.map(update => 
            this.prisma.schedule.update({
                where: { id: update.scheduleId },
                data: { shiftId: update.newShiftId },
                include: { shift: true }
            })
        );

        const results = await this.prisma.$transaction(updates);

        // Send notifications
        for (const [index, result] of results.entries()) {
            const originalUpdate = bulkUpdateDto.updates[index];
            const message = `Your shift for ${new Date(result.date).toLocaleDateString()} has been changed to the <span class="math-inline">\{result\.shift\.name\} \(</span>{result.shift.startTime} - ${result.shift.endTime}).`;
            await this.notificationService.createForDepartment(originalUpdate.originalDepartmentId, message);
        }

        return { message: 'Schedule updated successfully.' };
    }
}