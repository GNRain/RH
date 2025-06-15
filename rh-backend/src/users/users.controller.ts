import { Controller, Post, Body, UseGuards, Get, Param, Patch, Delete, Request, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Department } from '@prisma/client'; // --- MODIFIED IMPORT
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'express';
import { DepartmentsGuard } from 'src/auth/guards/departments.guard'; // --- NEW IMPORT
import { Departments } from 'src/auth/decorators/departments.decorator'; // --- NEW IMPORT

@Controller('users')
@UseGuards(JwtAuthGuard) // Apply JWT authentication to all routes in this controller
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Get('me/work-certificate')
  async getWorkCertificate(@Request() req, @Res() res: Response) {
    const userId = req.user.sub;
    const pdfBuffer = await this.usersService.generateWorkCertificate(userId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=attestation_de_travail.pdf');
    
    res.send(pdfBuffer);
  }

  @Post()
  // --- USE NEW GUARD AND DECORATOR ---
  @UseGuards(DepartmentsGuard)
  @Departments(Department.HR)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  
  @Get()
  // --- USE NEW GUARD AND DECORATOR ---
  @UseGuards(DepartmentsGuard)
  @Departments(Department.HR)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  // --- USE NEW GUARD AND DECORATOR ---
  @UseGuards(DepartmentsGuard)
  @Departments(Department.HR)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  // --- USE NEW GUARD AND DECORATOR ---
  @UseGuards(DepartmentsGuard)
  @Departments(Department.HR)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  // --- USE NEW GUARD AND DECORATOR ---
  @UseGuards(DepartmentsGuard)
  @Departments(Department.HR)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}