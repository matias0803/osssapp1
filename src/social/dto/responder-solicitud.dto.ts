import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class ResponderSolicitudDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['aceptar', 'rechazar'], { message: 'La acción debe ser aceptar o rechazar' })
  accion!: 'aceptar' | 'rechazar';
}
