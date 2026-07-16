import { Injectable, NotFoundException } from '@nestjs/common';
import { TecnicasRepository } from './tecnicas.repository';
import { Tecnica } from './entities/tecnica.entity';
import { CreateTecnicaDto } from './dto/create-tecnica.dto';
import { UpdateTecnicaDto } from './dto/update-tecnica.dto';
import { FilterTecnicaDto } from './dto/filter-tecnica.dto';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class TecnicasFirebaseRepository implements TecnicasRepository {
  private readonly collectionName = 'tecnicas';

  constructor(private readonly firebaseService: FirebaseService) {}

  async create(userId: string, datos: CreateTecnicaDto): Promise<Tecnica> {
    const docRef = this.firebaseService.firestore.collection(this.collectionName).doc();
    const nuevaTecnica = {
      userId,
      nombre: datos.nombre,
      nota: datos.nota,
      gi: datos.gi,
      tag: datos.tag || [],
      videoUrl: datos.videoUrl || null,
      conexiones: datos.conexiones || [],
    };
    
    Object.keys(nuevaTecnica).forEach(key => {
      if ((nuevaTecnica as any)[key] === undefined) {
        delete (nuevaTecnica as any)[key];
      }
    });

    await docRef.set(nuevaTecnica);
    return { id: docRef.id, ...nuevaTecnica } as Tecnica;
  }

  async findAll(userId: string, filtros?: FilterTecnicaDto): Promise<Tecnica[]> {
    let query: FirebaseFirestore.Query = this.firebaseService.firestore.collection(this.collectionName).where('userId', '==', userId);
    
    if (filtros) {
      if (filtros.gi !== undefined) {
        const isGi = filtros.gi.toString() === 'true';
        query = query.where('gi', '==', isGi);
      }
    }
    
    const snapshot = await query.get();
    let resultados = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Tecnica[];

    if (filtros) {
      if (filtros.nombre) {
        const nombreLower = filtros.nombre.toLowerCase();
        resultados = resultados.filter(t => t.nombre.toLowerCase().includes(nombreLower));
      }
      if (filtros.tag) {
        const tagLower = filtros.tag.toLowerCase();
        resultados = resultados.filter(t => t.tag && t.tag.some(tag => tag.toLowerCase() === tagLower));
      }
    }
    return resultados;
  }

  async findOne(userId: string, id: string): Promise<Tecnica | null> {
    const docRef = this.firebaseService.firestore.collection(this.collectionName).doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists || docSnap.data()?.userId !== userId) {
      return null;
    }
    return { id: docSnap.id, ...docSnap.data() } as Tecnica;
  }

  async update(userId: string, id: string, datos: UpdateTecnicaDto): Promise<Tecnica | null> {
    const docRef = this.firebaseService.firestore.collection(this.collectionName).doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists || docSnap.data()?.userId !== userId) {
      return null;
    }

    const dataToUpdate = { ...datos };
    Object.keys(dataToUpdate).forEach(
      key => (dataToUpdate as any)[key] === undefined && delete (dataToUpdate as any)[key]
    );

    await docRef.update(dataToUpdate);
    const updatedSnap = await docRef.get();
    return { id: updatedSnap.id, ...updatedSnap.data() } as Tecnica;
  }

  async remove(userId: string, id: string): Promise<boolean> {
    const docRef = this.firebaseService.firestore.collection(this.collectionName).doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists || docSnap.data()?.userId !== userId) {
      return false;
    }
    
    await docRef.delete();
    return true;
  }
}
