import { IsBoolean, IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class CreateTecnicaDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  nota!: string;

  @IsBoolean()
  gi!: boolean;

  @IsArray()
  @IsString({ each: true })
  tag!: string[];

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conexiones?: string[];
}