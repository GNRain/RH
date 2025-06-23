// src/positions/positions.module.ts

import { Module } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { PositionsController } from './positions.controller';
import { PrismaModule } from 'src/prisma/prisma.module'; // --- ADD THIS IMPORT ---

@Module({
  imports: [PrismaModule], // --- ADD THIS LINE ---
  controllers: [PositionsController],
  providers: [PositionsService],
})
export class PositionsModule {}