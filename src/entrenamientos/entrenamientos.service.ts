import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEntrenamientoDto } from './dto/create-entrenamiento.dto';
import { UpdateEntrenamientoDto } from './dto/update-entrenamiento.dto';
import { FilterEntrenamientoDto } from './dto/filter-entrenamiento.dto';
import { EntrenamientosRepository } from './entrenamientos.repository';

@Injectable()
export class EntrenamientosService {
  constructor(private readonly repositorio: EntrenamientosRepository) {}

  async create(userId: string, createEntrenamientoDto: CreateEntrenamientoDto) {
    return this.repositorio.create(userId, createEntrenamientoDto);
  }

  async findAll(userId: string, filter?: FilterEntrenamientoDto) {
    return this.repositorio.findAll(userId, filter);
  }

  async findOne(userId: string, id: string) {
    const entrenamiento = await this.repositorio.findOne(userId, id);
    if (!entrenamiento) {
      throw new NotFoundException(`Entrenamiento con ID ${id} no encontrado`);
    }
    return entrenamiento;
  }

  async update(userId: string, id: string, updateEntrenamientoDto: UpdateEntrenamientoDto) {
    const actualizado = await this.repositorio.update(userId, id, updateEntrenamientoDto);
    if (!actualizado) {
      throw new NotFoundException(`Entrenamiento con ID ${id} no encontrado para actualizar`);
    }
    return actualizado;
  }

  async remove(userId: string, id: string) {
    const eliminado = await this.repositorio.remove(userId, id);
    if (!eliminado) {
      throw new NotFoundException(`Entrenamiento con ID ${id} no encontrado para eliminar`);
    }
    return eliminado;
  }
}
