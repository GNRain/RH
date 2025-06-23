import { Controller, Post, Body, UseGuards, Get, Param, Patch, Delete, Request, Res, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role, UserStatus } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'express';
import { DepartmentsGuard } from 'src/auth/guards/departments.guard';
import { Departments } from 'src/auth/decorators/departments.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Get('me')
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.sub);
  }
  
  // ... other endpoints
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

  @Post()
  @UseGuards(DepartmentsGuard)
  @Departments('HR')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  
  @Get()
  @UseGuards(DepartmentsGuard)
  @Departments('HR')
  findAll(
    @Query('search') search?: string,
    @Query('department') department?: string,
    @Query('status') status?: UserStatus,
    @Query('role') role?: Role,
  ) {
    return this.usersService.findAll({ search, department, status, role });
  }

  @Get(':id')
  @UseGuards(DepartmentsGuard)
  @Departments('HR')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(DepartmentsGuard)
  @Departments('HR')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(DepartmentsGuard)
  @Departments('HR')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
  
  @Patch(':id/reset-2fa')
  @UseGuards(DepartmentsGuard)
  @Departments('HR')
  resetTwoFactor(@Param('id') id: string) {
    return this.usersService.resetTwoFactor(id);
  }
}