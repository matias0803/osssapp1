import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarPerfilDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  foto?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  graduacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  academia?: string;
}
