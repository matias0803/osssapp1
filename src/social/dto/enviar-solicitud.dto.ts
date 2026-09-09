import { IsEmail, IsOptional, IsString } from 'class-validator';

export class EnviarSolicitudDto {
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  destinatarioEmail?: string;

  @IsOptional()
  @IsString()
  destinatarioId?: string;

  @IsOptional()
  @IsString()
  destinatarioUsername?: string;
}
