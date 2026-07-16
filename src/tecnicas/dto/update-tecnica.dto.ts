import { PartialType } from '@nestjs/mapped-types';
import { CreateTecnicaDto } from './create-tecnica.dto';

export class UpdateTecnicaDto extends PartialType(CreateTecnicaDto) {}
