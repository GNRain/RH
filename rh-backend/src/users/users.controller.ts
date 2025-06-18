import { Controller, Post, Body, UseGuards, Get, Param, Patch, Delete, Request, Res, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Department, UserStatus } from '@prisma/client'; // --- MODIFIED IMPORT
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'express';
import { DepartmentsGuard } from 'src/auth/guards/departments.guard'; // --- NEW IMPORT
import { Departments } from 'src/auth/decorators/departments.decorator'; // --- NEW IMPORT
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard) // Apply JWT authentication to all routes in this controller
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
   @Get('me')
  getProfile(@Request() req) {
    // This now correctly handles GET /users/me
    return this.usersService.findOne(req.user.sub);
  }

  @Patch('me/password')
  changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.sub, changePasswordDto);
  }

  @Get('me/work-certificate')
  async getWorkCertificate(@Request() req, @Res() res: Response) {
    const userId = req.user.sub;
    const pdfBuffer = await this.usersService.generateWorkCertificate(userId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=attestation_de_travail.pdf');
    
    res.send(pdfBuffer);
  }

  // HR-specific routes for managing all users can come after.

  @Post()
  @UseGuards(DepartmentsGuard)
  @Departments(Department.HR)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  
  @Get()
  @UseGuards(DepartmentsGuard)
  @Departments(Department.HR)
  findAll(
    @Query('search') search?: string,
    @Query('department') department?: Department,
    @Query('status') status?: UserStatus,
  ) {
    return this.usersService.findAll({ search, department, status });
  }

  // The generic route with a parameter must come last.
  @Get(':id')
  @UseGuards(DepartmentsGuard)
  @Departments(Department.HR)
  findOne(@Param('id') id: string) {
    // This now correctly handles GET /users/some-id
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(DepartmentsGuard)
  @Departments(Department.HR)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(DepartmentsGuard)
  @Departments(Department.HR)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
  // --- END: REORDERED ROUTES ---
}