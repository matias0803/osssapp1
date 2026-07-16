import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTecnicaDto } from './dto/create-tecnica.dto';
import { UpdateTecnicaDto } from './dto/update-tecnica.dto';
import { FilterTecnicaDto } from './dto/filter-tecnica.dto';
import { TecnicasRepository } from './tecnicas.repository';

@Injectable()
export class TecnicasService {
  constructor(private readonly repositorio: TecnicasRepository) {}

  async create(userId: string, createTecnicaDto: CreateTecnicaDto) {
    return this.repositorio.create(userId, createTecnicaDto);
  }

  async findAll(userId: string, filtros?: FilterTecnicaDto) {
    return this.repositorio.findAll(userId, filtros);
  }

  async findOne(userId: string, id: string) {
    const tecnica = await this.repositorio.findOne(userId, id);
    if (!tecnica) {
      throw new NotFoundException(`Técnica con ID ${id} no encontrada`);
    }
    return tecnica;
  }

  async update(userId: string, id: string, updateTecnicaDto: UpdateTecnicaDto) {
    const tecnicaActualizada = await this.repositorio.update(userId, id, updateTecnicaDto);
    if (!tecnicaActualizada) {
      throw new NotFoundException(`Técnica con ID ${id} no encontrada para actualizar`);
    }
    return tecnicaActualizada;
  }

  async remove(userId: string, id: string) {
    const eliminado = await this.repositorio.remove(userId, id);
    if (!eliminado) {
      throw new NotFoundException(`Técnica con ID ${id} no encontrada para eliminar`);
    }
    return { mensaje: `Técnica con ID ${id} eliminada correctamente` };
  }
}
