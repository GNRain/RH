import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete, // Import Delete
  UseInterceptors,
  UploadedFile,
  Query,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import * as path from 'path';
import { Response } from 'express';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('stats')
  getStatistics() {
    return this.documentsService.getStatistics();
  }

  @Get('categories')
  findAllCategories() {
    return this.documentsService.findAllCategories();
  }

  @Get()
  findAll(@Query() query: QueryDocumentDto) {
    return this.documentsService.findAll(query);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/documents',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  )
  create(
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documentsService.create(createDocumentDto, file);
  }
  
  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
      await this.documentsService.incrementDownloadCount(id);
      const document = await this.documentsService.findOne(id);
      const filePath = path.join(process.cwd(), document.filePath);
      res.download(filePath);
  }

  // --- NEW ENDPOINT START ---
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
  // --- NEW ENDPOINT END ---
}