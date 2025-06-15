// src/users/users.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import * as PDFDocument from 'pdfkit'; // --- ADD IMPORT
import * as fs from 'fs';             // --- ADD IMPORT
import * as path from 'path';         // --- ADD IMPORT

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
        department: createUserDto.department,
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
  async generateWorkCertificate(userId: string): Promise<Buffer> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    const pdfDoc = new PDFDocument({ size: 'A4', margin: 50 });

    const streamToBuffer = (stream: NodeJS.ReadableStream): Promise<Buffer> => {
      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    };
    
    // --- Document Header ---
    
    const logoPath = path.join(process.cwd(), 'dist/assets/logo.png');
    if (fs.existsSync(logoPath)) {
        // --- MODIFIED IMAGE PLACEMENT ---
        // We explicitly provide x and y coordinates (the top-left margin)
        // before passing the options object.
        pdfDoc.image(logoPath, 50, 40, {
            width: 100, // Set a fixed width, height will scale automatically
        });
    }
    
    pdfDoc
      .fontSize(18)
      .text('Human Ressources Ghaith (HRG)', 50, 65, { align: 'center' });
    
    pdfDoc.moveDown(4);

    // --- Document Title ---
    pdfDoc.fontSize(20).font('Helvetica-Bold').text('ATTESTATION DE TRAVAIL', { align: 'center' });
    pdfDoc.moveDown(3);

    // --- Document Body ---
    const fullName = `${user.name} ${user.familyName}`;
    const joinDate = new Intl.DateTimeFormat('en-GB').format(user.joinDate);
    const currentDate = new Intl.DateTimeFormat('en-GB').format(new Date());

    pdfDoc.fontSize(12).font('Helvetica');
    pdfDoc.text(
        `This is to certify that Mr./Ms. ${fullName}, holder of CIN n° ${user.cin}, is currently employed by our company, Human Ressources Ghaith, since ${joinDate}.`,
        { align: 'justify' }
    );
    pdfDoc.moveDown();
    pdfDoc.text(
        `Mr./Ms. ${user.familyName} holds the position of ${user.position}.`,
        { align: 'justify' }
    );
    pdfDoc.moveDown();
    pdfDoc.text(
        'This certificate is issued to serve for whatever legal purpose it may serve.',
        { align: 'justify' }
    );
    pdfDoc.moveDown(4);

    // --- Document Footer ---
    pdfDoc.text(`Done at Mornag, on ${currentDate}.`, { align: 'right' });
    pdfDoc.moveDown(2);
    pdfDoc.text('Management', { align: 'right' });
    
    pdfDoc.end();

    return streamToBuffer(pdfDoc);
  }
  
}