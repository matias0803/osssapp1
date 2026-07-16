import { Injectable, NotFoundException } from '@nestjs/common';
import { EntrenamientosRepository } from './entrenamientos.repository';
import { Entrenamiento } from './entities/entrenamiento.entity';
import { CreateEntrenamientoDto } from './dto/create-entrenamiento.dto';
import { UpdateEntrenamientoDto } from './dto/update-entrenamiento.dto';
import { FilterEntrenamientoDto } from './dto/filter-entrenamiento.dto';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class EntrenamientosFirebaseRepository implements EntrenamientosRepository {
  private readonly collectionName = 'entrenamientos';

  constructor(private readonly firebaseService: FirebaseService) {}

  async create(userId: string, datos: CreateEntrenamientoDto): Promise<Entrenamiento> {
    const docRef = this.firebaseService.firestore.collection(this.collectionName).doc();
    const nuevoEntrenamiento = {
      userId,
      fecha: datos.fecha ? new Date(datos.fecha).toISOString() : new Date().toISOString(),
      objetivo: datos.objetivo,
      gi: datos.gi,
      tecnicaFocoId: datos.tecnicaFocoId || null,
      repeticionesEfectivas: datos.repeticionesEfectivas || null,
      posicionAtrapado: datos.posicionAtrapado || null,
      temaClase: datos.temaClase || null,
    };
    
    Object.keys(nuevoEntrenamiento).forEach(key => {
      if ((nuevoEntrenamiento as any)[key] === undefined) {
        delete (nuevoEntrenamiento as any)[key];
      }
    });

    await docRef.set(nuevoEntrenamiento);
    return { id: docRef.id, ...nuevoEntrenamiento, fecha: new Date(nuevoEntrenamiento.fecha) } as any;
  }

  async findAll(userId: string, filtros?: FilterEntrenamientoDto): Promise<Entrenamiento[]> {
    let query: FirebaseFirestore.Query = this.firebaseService.firestore.collection(this.collectionName).where('userId', '==', userId);
    
    if (filtros) {
      if (filtros.gi !== undefined) {
        const isGi = filtros.gi.toString() === 'true';
        query = query.where('gi', '==', isGi);
      }
    }
    
    const snapshot = await query.get();
    let resultados = snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data, 
        fecha: new Date(data.fecha) 
      };
    }) as any[];

    if (filtros) {
      if (filtros.objetivo) {
        const objetivoLower = filtros.objetivo.toLowerCase();
        resultados = resultados.filter(e => e.objetivo.toLowerCase().includes(objetivoLower));
      }
      if (filtros.fecha) {
        // Asume fecha formato YYYY-MM-DD
        resultados = resultados.filter(e => {
            return (e.fecha as Date).toISOString().startsWith(String(filtros.fecha));
        });
      }
    }
    return resultados;
  }

  async findOne(userId: string, id: string): Promise<Entrenamiento | null> {
    const docRef = this.firebaseService.firestore.collection(this.collectionName).doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists || docSnap.data()?.userId !== userId) {
      return null;
    }
    const data = docSnap.data()!;
    return { id: docSnap.id, ...data, fecha: new Date(data.fecha) } as any;
  }

  async update(userId: string, id: string, datos: UpdateEntrenamientoDto): Promise<Entrenamiento | null> {
    const docRef = this.firebaseService.firestore.collection(this.collectionName).doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists || docSnap.data()?.userId !== userId) {
      return null;
    }

    const dataToUpdate: any = { ...datos };
    
    if (dataToUpdate.fecha) {
        dataToUpdate.fecha = new Date(dataToUpdate.fecha).toISOString();
    }

    Object.keys(dataToUpdate).forEach(
      key => dataToUpdate[key] === undefined && delete dataToUpdate[key]
    );

    await docRef.update(dataToUpdate);
    const updatedSnap = await docRef.get();
    const updatedData = updatedSnap.data()!;
    return { id: updatedSnap.id, ...updatedData, fecha: new Date(updatedData.fecha) } as any;
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
