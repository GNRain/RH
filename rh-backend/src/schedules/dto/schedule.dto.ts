// src/schedules/dto/schedule.dto.ts

// This DTO defines the shape of the schedule objects returned by the API.
export class GeneratedScheduleDto {
    id: string;
    date: string;
    department: {
        id: string;
        name: string;
    };
    shift: {
        id: string;
        name: string;
        startTime: string;
        endTime: string;
        color: string;
    };
}
