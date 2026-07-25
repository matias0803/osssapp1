import { PartialType } from '@nestjs/mapped-types';
import { CreateObjetivoDto } from './create-objetivo.dto';

export class UpdateObjetivoDto extends PartialType(CreateObjetivoDto) {}
