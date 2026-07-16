import { Injectable } from '@nestjs/common';
import { Entrenamiento } from './entities/entrenamiento.entity';
import { EntrenamientosRepository } from './entrenamientos.repository';
import { CreateEntrenamientoDto } from './dto/create-entrenamiento.dto';
import { UpdateEntrenamientoDto } from './dto/update-entrenamiento.dto';
import { FilterEntrenamientoDto } from './dto/filter-entrenamiento.dto';
import { filter } from 'rxjs';

@Injectable()
export class EntrenamientosMemoryRepository implements EntrenamientosRepository {
  private Entrenamientos: Entrenamiento[] = [
     {
    id: '1',
    fecha: new Date("2026-07-10"),
    objetivo: "Practicar escapes de side control",
    gi: true,
  },
  {
    id: '2',
    fecha: new Date("2026-07-12"),
    objetivo: "Mejorar derribos y entradas a single leg",
    gi: false,
  },
  {
    id: '3',
    fecha: new Date("2026-07-15"),
    objetivo: "Trabajar pases de guardia y control de presión",
    gi: true,
  },
  ];
  private idContador = 4;

  async create(userId: string, datos: CreateEntrenamientoDto): Promise<Entrenamiento> {
    const id = Date.now().toString();
    const nuevoEntrenamiento: Entrenamiento = {
      id,
      userId,
      fecha: datos.fecha ? new Date(datos.fecha) : new Date(),
      objetivo: datos.objetivo,
      gi: datos.gi,
      tecnicaFocoId: datos.tecnicaFocoId,
      repeticionesEfectivas: datos.repeticionesEfectivas,
      posicionAtrapado: datos.posicionAtrapado,
      temaClase: datos.temaClase
    };
    
    this.Entrenamientos.push(nuevoEntrenamiento);
    return nuevoEntrenamiento;
  }

  async findAll(userId: string, filtros?: FilterEntrenamientoDto): Promise<Entrenamiento[]> {
    let resultado = this.Entrenamientos.filter(e => e.userId === userId);
    console.log(filtros)
    if (!filtros) return resultado;

    if (filtros.fecha) {
      resultado = resultado.filter(t => 
        t.fecha.toISOString().startsWith(String(filtros.fecha))
      );
    }
    
    if (filtros.gi !== undefined) {
      resultado = resultado.filter(t => t.gi === filtros.gi);
    }

    if (filtros.objetivo) {
      resultado = resultado.filter(t => 
        t.objetivo.includes(filtros.objetivo!)
      );
    }
    return resultado;
  }

  async findOne(userId: string, id: string): Promise<Entrenamiento | null> {
    const entrenamiento = this.Entrenamientos.find(e => e.id === id && e.userId === userId);
    return entrenamiento || null;
  }

  async update(userId: string, id: string, datos: UpdateEntrenamientoDto): Promise<Entrenamiento | null> {
    const indice = this.Entrenamientos.findIndex(e => e.id === id && e.userId === userId);
    if (indice === -1) return null;
    this.Entrenamientos[indice] = { ...this.Entrenamientos[indice], ...datos };
    return this.Entrenamientos[indice];
  }

  async remove(userId: string, id: string): Promise<boolean> {
    const indice = this.Entrenamientos.findIndex(e => e.id === id && e.userId === userId);
    if (indice === -1) return false;
    this.Entrenamientos.splice(indice, 1);
    return true;
  }
}