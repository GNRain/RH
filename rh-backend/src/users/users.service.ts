// src/users/users.service.ts

import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common'; // --- ADD ConflictException
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import * as PDFDocument from 'pdfkit'; // --- ADD IMPORT
import * as fs from 'fs';             // --- ADD IMPORT
import * as path from 'path';         // --- ADD IMPORT
import { ChangePasswordDto } from './dto/change-password.dto'; // --- ADD IMPORT
import { AuthService } from 'src/auth/auth.service'; //
import { MailService } from 'src/mail/mail.service'; // --- ADD IMPORT
import { Department, Prisma, User, Role, UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    private mailService: MailService, // --- ADD MailService
  ) {}

  /**
   * Creates a new user in the database.
   * This is called by the POST /users endpoint.
   * @param createUserDto The data for the new user.
   * @returns The newly created user object, without the password hash.
   */
  async create(createUserDto: CreateUserDto) {
    // Check if user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }

    const roundsOfHashing = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password_to_be_hashed, roundsOfHashing);

    const data: Prisma.UserCreateInput = {
      email: createUserDto.email,
      password: hashedPassword,
      name: createUserDto.name,
      familyName: createUserDto.familyName,
      phoneNumber: createUserDto.phoneNumber,
      cin: createUserDto.cin,
      role: createUserDto.role,
      // Connect to relations using IDs
      department: { connect: { id: createUserDto.departmentId } }, // Use connect for department
      position: { connect: { id: createUserDto.positionId } },   // Use connect for position
    };

    if (createUserDto.teamLeader) {
      data.teamLeader = { connect: { id: createUserDto.teamLeader } };
    }
    if (createUserDto.manager) {
      data.manager = { connect: { id: createUserDto.manager } };
    }

    const newUser = await this.prisma.user.create({
      data,
    });

    // --- Send welcome email ---
    await this.mailService.sendWelcomeEmail(newUser);

    const { password, ...result } = newUser;
    return result;
  }

  /**
   * Retrieves all users from the database.
   * This is called by the GET /users endpoint.
   * @returns A list of all user objects, without their password hashes.
   */
  // UPDATED findAll to correctly handle role filtering
  async findAll(params: {
    search?: string;
    department?: string; // Now a string to filter by name
    status?: UserStatus;
    role?: Role;
  }) {
    const { search, department, status, role } = params;
    const where: Prisma.UserWhereInput = {};

    if (status) where.status = status;
    if (role) where.role = role;
    if (department) where.department = { id: department }; // Filter by relation (using ID)

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { familyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { cin: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      // --- NEW: Include the names from the related tables ---
      include: {
        department: { select: { name: true } },
        position: { select: { name: true } },
      },
    });
    // We don't need to delete the password as it's not selected.
    return users;
  }

  async resetTwoFactor(userId: string) {
    await this.findOne(userId); // Ensures user exists
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isTwoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });
    return { message: '2FA has been reset successfully for the user.' };
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
      // --- NEW: Include relations ---
      include: {
        department: true,
        position: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    const { password, ...result } = user;
    return result;
  }
  /**
   * Updates a user's data.
   * @param id The ID of the user to update.
   * @param updateUserDto The data to update.
   * @returns The updated user object, without the password.
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    // Create a mutable copy and remove unwanted properties
    const dtoCopy: any = { ...updateUserDto };
    delete dtoCopy.department; // Remove the department object if it exists
    delete dtoCopy.position;   // Remove the position object if it exists

    const { password_to_be_hashed, teamLeader, manager, departmentId, positionId, ...restOfDto } = dtoCopy;
    const data: Prisma.UserUpdateInput = { ...restOfDto };

    if (teamLeader !== undefined) {
      if (teamLeader === null) {
        data.teamLeader = { disconnect: true };
      } else {
        data.teamLeader = { connect: { id: teamLeader } };
      }
    }

    if (manager !== undefined) {
      if (manager === null) {
        data.manager = { disconnect: true };
      } else {
        data.manager = { connect: { id: manager } };
      }
    }

    if (departmentId !== undefined && departmentId !== null) { // Only connect if provided and not null
      data.department = { connect: { id: departmentId } };
    }

    if (positionId !== undefined && positionId !== null) { // Only connect if provided and not null
      data.position = { connect: { id: positionId } };
    }

    if (password_to_be_hashed) {
      const roundsOfHashing = 10;
      data.password = await bcrypt.hash(password_to_be_hashed, roundsOfHashing);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });
    const { password, ...result } = updatedUser;
    return result;
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
 // --- This method needs a major update to use the relations ---
  async generateWorkCertificate(userId: string): Promise<Buffer> {
    const user = await this.findOne(userId); // findOne now includes relations
    if (!user) throw new NotFoundException(`User with ID "${userId}" not found`);

    const pdfDoc = new PDFDocument({ size: 'A4', margin: 50 });
    // ... (streamToBuffer helper function)
    const streamToBuffer = (stream: NodeJS.ReadableStream): Promise<Buffer> => new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });

    // ... (header and logo logic)
    pdfDoc.fontSize(20).font('Helvetica-Bold').text('ATTESTATION DE TRAVAIL', { align: 'center' });
    pdfDoc.moveDown(3);
    
    const fullName = `${user.name} ${user.familyName}`;
    const joinDate = new Intl.DateTimeFormat('en-GB').format(new Date(user.joinDate));
    const currentDate = new Intl.DateTimeFormat('en-GB').format(new Date());

    pdfDoc.fontSize(12).font('Helvetica');
    pdfDoc.text(`This is to certify that Mr./Ms. ${fullName}, holder of CIN n° ${user.cin}, is currently employed by our company, Human Ressources Ghaith, since ${joinDate}.`);
    pdfDoc.moveDown();
    // --- UPDATED: Use the position name from the relation ---
    pdfDoc.text(`Mr./Ms. ${user.familyName} holds the position of ${user.position.name}.`);
    // ... (rest of PDF generation)
    pdfDoc.moveDown();
    pdfDoc.text('This certificate is issued to serve for whatever legal purpose it may serve.');
    pdfDoc.moveDown(4);
    pdfDoc.text(`Done at Mornag, on ${currentDate}.`, { align: 'right' });
    pdfDoc.moveDown(2);
    pdfDoc.text('Management', { align: 'right' });
    
    pdfDoc.end();
    return streamToBuffer(pdfDoc);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // 1. Verify old password
    const isOldPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Invalid old password.');
    }

    // 2. Verify 2FA code
    const is2faCodeValid = this.authService.isTwoFactorCodeValid(
      changePasswordDto.twoFactorCode,
      user,
    );
    if (!is2faCodeValid) {
      throw new UnauthorizedException('Invalid 2FA code.');
    }

    // 3. Hash and update new password
    const newHashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: newHashedPassword },
    });

    return { message: 'Password changed successfully.' };
  }
  
}