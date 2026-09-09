import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CompartirTecnicasDto {
  @IsArray({ message: 'tecnicaIds debe ser una lista' })
  @IsNotEmpty({ message: 'Debes seleccionar al menos una técnica para compartir' })
  @IsString({ each: true, message: 'Cada id de técnica debe ser un texto' })
  tecnicaIds!: string[];

  @IsOptional()
  @IsString()
  nota?: string;
}
