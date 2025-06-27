import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  create(createDepartmentDto: CreateDepartmentDto) {
    return this.prisma.department.create({ data: createDepartmentDto });
  }

  findAll() {
    return this.prisma.department.findMany({
      orderBy: { name: 'asc' },
      // Include the color and default shift details
      include: {
        defaultShift: true,
      },
    });
  }

  update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    return this.prisma.department.update({ where: { id }, data: updateDepartmentDto });
  }

  remove(id: string) {
    return this.prisma.department.delete({ where: { id } });
  }
}
