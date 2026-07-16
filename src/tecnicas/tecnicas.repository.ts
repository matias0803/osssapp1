import { CreateTecnicaDto } from './dto/create-tecnica.dto';
import { UpdateTecnicaDto } from './dto/update-tecnica.dto';
import { FilterTecnicaDto } from './dto/filter-tecnica.dto';
import { Tecnica } from './entities/tecnica.entity';

export abstract class TecnicasRepository {
  // Usamos Promise porque las bases de datos reales tardan en responder
  abstract create(userId: string, datos: CreateTecnicaDto): Promise<Tecnica>;
  abstract findAll(userId: string, filtros?: FilterTecnicaDto): Promise<Tecnica[]>;
  abstract findOne(userId: string, id: string): Promise<Tecnica | null>;
  abstract update(userId: string, id: string, datos: UpdateTecnicaDto): Promise<Tecnica | null>;
  abstract remove(userId: string, id: string): Promise<boolean>;
}