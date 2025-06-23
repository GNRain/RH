import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(private prisma: PrismaService) {}

  create(createPositionDto: CreatePositionDto) {
    // We store positions as keys, so we ensure it's formatted correctly
    const positionKey = `position_${createPositionDto.name.toLowerCase().replace(/\s+/g, '_')}`;
    return this.prisma.position.create({ data: { name: positionKey } });
  }

  findAll() {
    return this.prisma.position.findMany({ orderBy: { name: 'asc' } });
  }

  update(id: string, updatePositionDto: UpdatePositionDto) {
    if (!updatePositionDto.name) {
      throw new Error('Position name is required for update.');
    }
    const positionKey = `position_${updatePositionDto.name.toLowerCase().replace(/\s+/g, '_')}`;
    return this.prisma.position.update({ where: { id }, data: { name: positionKey } });
  }

  remove(id: string) {
    return this.prisma.position.delete({ where: { id } });
  }
}