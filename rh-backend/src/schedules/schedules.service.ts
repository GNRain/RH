// rh-backend/src/schedules/schedules.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetScheduleDto } from './dto/get-schedule.dto';
import { BulkUpdateScheduleDto } from './dto/bulk-update-schedule.dto';
import { NotificationService } from 'src/notifications/notification.service';
import { eachDayOfInterval } from 'date-fns';
import { GeneratedScheduleDto } from './dto/schedule.dto';
//test
@Injectable()
export class SchedulesService {
    constructor(
        private prisma: PrismaService,
        private notificationService: NotificationService
    ) {}

    async findAll(query: GetScheduleDto): Promise<GeneratedScheduleDto[]> {
        const startDate = new Date(query.startDate);
        const endDate = new Date(new Date(query.endDate).setUTCHours(23, 59, 59, 999));

        const departments = await this.prisma.department.findMany({
            where: {
                name: {
                    not: 'HR'
                }
            },
            include: {
                defaultShift: true
            }
        });

        const overrides = await this.prisma.scheduleOverride.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                shift: true
            }
        });
        
        const overrideMap = new Map<string, any>();
        for (const override of overrides) {
            const key = `${override.date.toISOString().split('T')[0]}-${override.departmentId}`;
            overrideMap.set(key, override);
        }
        
        const schedule: GeneratedScheduleDto[] = [];
        const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

        for (const date of dateRange) {
            const dateStr = date.toISOString().split('T')[0];
            for (const department of departments) {
                const overrideKey = `${dateStr}-${department.id}`;
                const override = overrideMap.get(overrideKey);

                const shift = override ? override.shift : department.defaultShift;
                if (!shift) continue;

                schedule.push({
                    id: override ? override.id : `${department.id}-${dateStr}`,
                    date: dateStr,
                    department: {
                        id: department.id,
                        name: department.name,
                    },
                    shift: {
                        id: shift.id,
                        name: shift.name,
                        startTime: shift.startTime,
                        endTime: shift.endTime,
                        color: department.color
                    },
                });
            }
        }

        return schedule;
    }

    async bulkUpdate(bulkUpdateDto: BulkUpdateScheduleDto) {
        const { updates } = bulkUpdateDto;

        const transactions = updates.map(update => {
            const date = new Date(update.date);
            return this.prisma.scheduleOverride.upsert({
                where: {
                    date_departmentId: {
                        date: date,
                        departmentId: update.departmentId
                    }
                },
                update: { shiftId: update.newShiftId },
                create: {
                    date: date,
                    departmentId: update.departmentId,
                    shiftId: update.newShiftId
                },
                include: {
                    shift: true,
                    department: true,
                }
            });
        });

        const results = await this.prisma.$transaction(transactions);

        for (const result of results) {
            const message = `Your shift for ${result.date.toLocaleDateString()} has been changed to the ${result.shift.name} (${result.shift.startTime} - ${result.shift.endTime}).`;
            await this.notificationService.createForDepartment(result.department.name, message);
        }

        return { message: 'Schedule updated successfully.' };
    }
}