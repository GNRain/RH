import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(private prisma: PrismaService) {}

  async create(createPositionDto: CreatePositionDto) {
    const { defaultName, translations } = createPositionDto;

    const newPosition = await this.prisma.position.create({
      data: {
        defaultName: defaultName,
      },
    });

    if (translations && translations.length > 0) {
      await this.prisma.positionTranslation.createMany({
        data: translations.map(t => ({
          positionId: newPosition.id,
          languageCode: t.languageCode,
          translatedName: t.translatedName,
        })),
      });
    } else {
      // Create a default translation if none are provided
      await this.prisma.positionTranslation.create({
        data: {
          positionId: newPosition.id,
          languageCode: 'en', // Default language
          translatedName: defaultName,
        },
      });
    }

    return newPosition;
  }

  async findAll(lang?: string) {
    const positions = await this.prisma.position.findMany({
      include: {
        translations: true,
      },
      orderBy: { defaultName: 'asc' },
    });

    return positions.map(position => {
      const translatedName = lang
        ? position.translations.find(t => t.languageCode === lang)?.translatedName
        : position.defaultName; // Fallback to defaultName if no lang or translation not found

      return {
        ...position,
        name: translatedName || position.defaultName, // Ensure 'name' field exists for frontend compatibility
      };
    });
  }

  async update(id: string, updatePositionDto: UpdatePositionDto) {
    const { defaultName, translations } = updatePositionDto;

    const updatedPosition = await this.prisma.position.update({
      where: { id },
      data: {
        defaultName: defaultName || undefined, // Only update if provided
      },
    });

    if (translations) {
      // Delete existing translations for this position
      await this.prisma.positionTranslation.deleteMany({
        where: { positionId: id },
      });

      // Create new translations
      await this.prisma.positionTranslation.createMany({
        data: translations.map(t => ({
          positionId: id,
          languageCode: t.languageCode,
          translatedName: t.translatedName,
        })),
      });
    }

    return updatedPosition;
  }

  async remove(id: string) {
    // Delete associated translations first
    await this.prisma.positionTranslation.deleteMany({
      where: { positionId: id },
    });
    return this.prisma.position.delete({ where: { id } });
  }
}