// src/users/users.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new user in the database.
   * This is called by the POST /users endpoint.
   * @param createUserDto The data for the new user.
   * @returns The newly created user object, without the password hash.
   */
  async create(createUserDto: CreateUserDto) {
    // Hash the password before saving
    const roundsOfHashing = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password_to_be_hashed,
      roundsOfHashing,
    );

    const newUser = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
        familyName: createUserDto.familyName,
        phoneNumber: createUserDto.phoneNumber,
        cin: createUserDto.cin,
        position: createUserDto.position,
        role: createUserDto.role,
      },
    });

    // Return the user object without the password
    const { password, ...result } = newUser;
    return result;
  }

  /**
   * Retrieves all users from the database.
   * This is called by the GET /users endpoint.
   * @returns A list of all user objects, without their password hashes.
   */
  async findAll() {
    const users = await this.prisma.user.findMany();

    // We must ensure we don't leak password hashes in our API responses
    users.forEach(user => delete (user as { password?: string }).password);
    
    return users;
  }
  /**
   * Retrieves a single user by their ID.
   * @param id The unique ID of the user.
   * @returns A single user object, without the password hash.
   * @throws NotFoundException if a user with the given ID is not found.
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    delete (user as { password?: string }).password;
    return user;
  }
  /**
   * Updates a user's data.
   * @param id The ID of the user to update.
   * @param updateUserDto The data to update.
   * @returns The updated user object, without the password.
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    // We explicitly remove the password from the DTO to prevent updating it here
    delete updateUserDto.password_to_be_hashed;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    delete (updatedUser as { password?: string }).password;
    return updatedUser;
  }
  /**
   * Deletes a user from the database.
   * @param id The ID of the user to delete.
   * @returns The user object that was deleted.
   */
  async remove(id: string) {
    // We'll first call findOne to ensure the user exists.
    // This will throw a NotFoundException if they don't, which is good practice.
    await this.findOne(id);

    return this.prisma.user.delete({
      where: { id },
    });
  }
}