import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { PrismaModule } from '../prisma/prisma.module'; // --- THIS IS THE FIX ---

@Module({
  imports: [PrismaModule], // --- ADD PrismaModule HERE ---
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}