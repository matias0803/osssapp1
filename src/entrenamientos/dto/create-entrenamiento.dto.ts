
import { IsBoolean, IsNotEmpty, IsString, IsArray, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
 
export class CreateEntrenamientoDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fecha!: Date;

  @IsString()
  @IsNotEmpty()
  objetivo!: string;
  @IsNotEmpty()
  @IsBoolean()
  gi!: boolean;

  @IsOptional()
  @IsString()
  tecnicaFocoId?: string;

  @IsOptional()
  repeticionesEfectivas?: number;

  @IsOptional()
  @IsString()
  posicionAtrapado?: string;

  @IsOptional()
  @IsString()
  temaClase?: string;
}
