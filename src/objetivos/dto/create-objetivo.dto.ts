import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateObjetivoDto {
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @IsString()
  @IsNotEmpty()
  tipo!: string;

  @IsBoolean()
  @IsOptional()
  completado?: boolean; 
}