import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateObjetivoDto } from './dto/create-objetivo.dto';
import { UpdateObjetivoDto } from './dto/update-objetivo.dto';
import { Objetivo } from './entities/objetivo.entity';
import { FirebaseService } from '../firebase/firebase.service'; // Asegúrate de que la ruta sea correcta

@Injectable()
export class ObjetivosService {
  private readonly collectionName = 'objetivos';

  // Inyectamos el servicio de Firebase
  constructor(private readonly firebaseService: FirebaseService) {}

  async create(userId: string, createObjetivoDto: CreateObjetivoDto): Promise<Objetivo> {
    
    const nuevoObjetivo = {
      userId,
      titulo: createObjetivoDto.titulo,
      tipo: createObjetivoDto.tipo,
      completado: createObjetivoDto.completado || false,
      fechaCreacion: new Date().toISOString(),
    };

    // Obtenemos una referencia a un documento nuevo (con ID autogenerado)
    const docRef = this.firebaseService.firestore.collection(this.collectionName).doc();
    
    // Guardamos los datos en Firestore
    await docRef.set(nuevoObjetivo);

    // Retornamos el objeto incluyendo el ID generado por Firestore
    return { id: docRef.id, ...nuevoObjetivo } as Objetivo;
  }

  async findAll(userId: string): Promise<Objetivo[]> {
    const snapshot = await this.firebaseService.firestore.collection(this.collectionName).where('userId', '==', userId).get();
    
    // Mapeamos los documentos a nuestro formato de Objetivo
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Objetivo[];
  }

  async findOne(userId: string, id: string): Promise<Objetivo> {
    const docRef = this.firebaseService.firestore.collection(this.collectionName).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists || docSnap.data()?.userId !== userId) {
      throw new NotFoundException(`Objetivo con ID ${id} no encontrado`);
    }

    return { id: docSnap.id, ...docSnap.data() } as Objetivo;
  }

  async update(userId: string, id: string, updateObjetivoDto: UpdateObjetivoDto): Promise<Objetivo> {
    const docRef = this.firebaseService.firestore.collection(this.collectionName).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists || docSnap.data()?.userId !== userId) {
      throw new NotFoundException(`Objetivo con ID ${id} no encontrado`);
    }

    // Firestore ignora las propiedades 'undefined', por lo que podemos pasar 
    // directamente el DTO si está limpio, o usar la actualización explícita:
    const dataToUpdate = { ...updateObjetivoDto };
    
    // Limpiamos undefined para evitar errores en Firestore
    Object.keys(dataToUpdate).forEach(
      key => dataToUpdate[key] === undefined && delete dataToUpdate[key]
    );

    // .update() modifica solo los campos provistos, manteniendo el resto intacto
    await docRef.update(dataToUpdate);

    // Obtenemos el documento actualizado para retornarlo
    const updatedSnap = await docRef.get();
    return { id: updatedSnap.id, ...updatedSnap.data() } as Objetivo;
  }

  async remove(userId: string, id: string): Promise<{ mensaje: string }> {
    const docRef = this.firebaseService.firestore.collection(this.collectionName).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists || docSnap.data()?.userId !== userId) {
      throw new NotFoundException(`Objetivo con ID ${id} no encontrado`);
    }

    // Eliminamos el documento de Firestore
    await docRef.delete();
    
    return { mensaje: `Objetivo ${id} eliminado` };
  }
}