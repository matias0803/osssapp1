import { PartialType } from '@nestjs/mapped-types';
import { CreateEntrenamientoDto } from './create-entrenamiento.dto';

export class UpdateEntrenamientoDto extends PartialType(CreateEntrenamientoDto) {}
