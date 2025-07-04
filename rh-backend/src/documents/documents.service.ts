import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import * as fs from 'fs/promises'; // Import the fs promises module

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createDocumentDto: CreateDocumentDto,
    file: Express.Multer.File,
  ) {
    return this.prisma.document.create({
      data: {
        ...createDocumentDto,
        format: file.originalname.split('.').pop()?.toUpperCase() || 'UNKNOWN',
        size: Math.round(file.size / 1024),
        filePath: file.path,
      },
    });
  }

  async findAll(query: QueryDocumentDto) {
    const { search, category } = query;
    return this.prisma.document.findMany({
      where: {
        title: {
          contains: search,
          mode: 'insensitive',
        },
        categoryId: category,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const document = await this.prisma.document.findUnique({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document with ID "${id}" not found`);
    }
    return document;
  }
  
  // --- NEW METHOD START ---
  async remove(id: string) {
    const document = await this.findOne(id); // Reuse findOne to ensure it exists
    try {
      // Delete the physical file from the server
      await fs.unlink(document.filePath);
    } catch (error) {
      // Log the error but don't block the process if the file is already gone
      console.error(`Failed to delete file at ${document.filePath}:`, error);
    }
    // Delete the record from the database
    return this.prisma.document.delete({
      where: { id },
    });
  }
  // --- NEW METHOD END ---

  async incrementDownloadCount(id: string) {
    return this.prisma.document.update({
        where: { id },
        data: {
            downloads: {
                increment: 1
            }
        }
    });
  }

  async getStatistics() {
    const totalDocuments = await this.prisma.document.count();
    const totalCategories = await this.prisma.documentCategory.count();
    
    const totalDownloadsResult = await this.prisma.document.aggregate({
      _sum: {
        downloads: true,
      },
    });
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const updatedThisWeek = await this.prisma.document.count({
      where: {
        updatedAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    return {
      totalDocuments,
      totalCategories,
      totalDownloads: totalDownloadsResult._sum.downloads || 0,
      updatedThisWeek,
    };
  }
  
  async findAllCategories() {
      return this.prisma.documentCategory.findMany();
  }
}