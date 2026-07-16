import { CreateEntrenamientoDto } from './dto/create-entrenamiento.dto';
import { UpdateEntrenamientoDto } from './dto/update-entrenamiento.dto';
import { Entrenamiento } from './entities/entrenamiento.entity';
import { FilterEntrenamientoDto } from './dto/filter-entrenamiento.dto';

export abstract class EntrenamientosRepository {
  // Usamos Promise porque las bases de datos reales tardan en responder
  abstract create(userId: string, datos: CreateEntrenamientoDto): Promise<Entrenamiento>;
  abstract findAll(userId: string, filtros?: FilterEntrenamientoDto): Promise<Entrenamiento[]>;
  abstract findOne(userId: string, id: string): Promise<Entrenamiento | null>;
  abstract update(userId: string, id: string, datos: UpdateEntrenamientoDto): Promise<Entrenamiento | null>;
  abstract remove(userId: string, id: string): Promise<boolean>;
}