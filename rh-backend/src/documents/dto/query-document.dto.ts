import { IsString, IsOptional } from 'class-validator';

export class QueryDocumentDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  category?: string;
}