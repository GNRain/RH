// src/users/users.controller.ts

import { Controller, Post, Body, UseGuards, Get, Param, Patch, Delete } from '@nestjs/common'; 
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) // Apply both guards
  @Roles(Role.RH) // Specify that only users with the 'RH' role can access this
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  
  @Get() // Handles GET requests to /users
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RH)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id') // Handles GET requests to /users/some-id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RH)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id') // Handles PATCH requests to /users/some-id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RH)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id') // Handles DELETE requests to /users/some-id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RH)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
