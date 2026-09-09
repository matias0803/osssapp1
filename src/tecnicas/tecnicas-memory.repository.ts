import { Injectable } from '@nestjs/common';
import { Tecnica } from './entities/tecnica.entity';
import { TecnicasRepository } from './tecnicas.repository';
import { CreateTecnicaDto } from './dto/create-tecnica.dto';
import { UpdateTecnicaDto } from './dto/update-tecnica.dto';
import { FilterTecnicaDto } from './dto/filter-tecnica.dto';

@Injectable()
export class TecnicasMemoryRepository implements TecnicasRepository {
  private tecnicas: Tecnica[] = [
    { 
      id: '1', 
      userId: 'test-user',
      nombre: 'Armbar Clásico', 
      nota: 'Mantener las rodillas bien juntas y los pulgares apuntando hacia arriba.', 
      gi: true, 
      tag: ['sumisión', 'guardia-cerrada'] 
    },
    { 
      id: '2', 
      userId: 'test-user',
      nombre: 'Mata León (Rear Naked Choke)', 
      nota: 'Esconder la mano detrás de la cabeza del oponente, no en la nuca.', 
      gi: false, 
      tag: ['sumisión', 'espalda'] 
    }
  ];

  async create(userId: string, datos: CreateTecnicaDto): Promise<Tecnica> {
    const id = Date.now().toString(); // ID de juguete
    const nuevaTecnica: Tecnica = {
      id,
      userId,
      ...datos,
      gi: datos.gi !== undefined ? datos.gi : true, // Valor por defecto
      videoUrl: datos.videoUrl || '',
      conexiones: datos.conexiones || [],
      tag: datos.tag || []
    };
    
    this.tecnicas.push(nuevaTecnica);
    return nuevaTecnica;
  }

  async findAll(userId: string, filtros?: FilterTecnicaDto): Promise<Tecnica[]> {
    let resultado = this.tecnicas.filter(t => t.userId === userId);

    if (!filtros) return resultado;

    if (filtros.nombre) {
      resultado = resultado.filter(t => 
        t.nombre.toLowerCase().includes(filtros.nombre!.toLowerCase())
      );
    }
    
    if (filtros.gi !== undefined) {
      resultado = resultado.filter(t => t.gi === filtros.gi);
    }

    if (filtros.tag) {
      resultado = resultado.filter(t => 
        t.tag.some(etiqueta => etiqueta.toLowerCase() === filtros.tag!.toLowerCase())
      );
    }

    return resultado;
  }

  async findOne(userId: string, id: string): Promise<Tecnica | null> {
    const tecnica = this.tecnicas.find(t => t.id === id && t.userId === userId);
    return tecnica || null;
  }

  async update(userId: string, id: string, datos: UpdateTecnicaDto): Promise<Tecnica | null> {
    const indice = this.tecnicas.findIndex(t => t.id === id && t.userId === userId);
    if (indice === -1) return null;
    this.tecnicas[indice] = { ...this.tecnicas[indice], ...datos };
    return this.tecnicas[indice];
  }

  async remove(userId: string, id: string): Promise<boolean> {
    const indice = this.tecnicas.findIndex(t => t.id === id && t.userId === userId);
    if (indice === -1) return false;
    this.tecnicas.splice(indice, 1);
    return true;
  }
}