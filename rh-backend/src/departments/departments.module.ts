// src/departments/departments.module.ts

import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { PrismaModule } from 'src/prisma/prisma.module'; // --- ADD THIS IMPORT ---

@Module({
  imports: [PrismaModule], // --- ADD THIS LINE ---
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
})
export class DepartmentsModule {}