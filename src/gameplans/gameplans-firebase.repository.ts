import { Injectable, NotFoundException } from '@nestjs/common';
import { GamePlansRepository } from './gameplans.repository';
import { GamePlan } from './entities/gameplan.entity';
import { CreateGamePlanDto } from './dto/create-gameplan.dto';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class GamePlansFirebaseRepository implements GamePlansRepository {
  private readonly collectionName = 'gameplans';

  constructor(private readonly firebaseService: FirebaseService) {}

  async create(userId: string, datos: CreateGamePlanDto): Promise<GamePlan> {
    const docRef = this.firebaseService.firestore.collection(this.collectionName).doc();
    const nuevoGamePlan = {
      userId,
      titulo: datos.titulo,
      tecnicasIds: datos.tecnicasIds || [],
    };
    
    Object.keys(nuevoGamePlan).forEach(key => {
      if ((nuevoGamePlan as any)[key] === undefined) {
        delete (nuevoGamePlan as any)[key];
      }
    });

    await docRef.set(nuevoGamePlan);
    return { id: docRef.id, ...nuevoGamePlan } as GamePlan;
  }

  async findAll(userId: string): Promise<GamePlan[]> {
    const query = this.firebaseService.firestore.collection(this.collectionName).where('userId', '==', userId);
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GamePlan[];
  }

  async findOne(userId: string, id: string): Promise<GamePlan | null> {
    const docRef = this.firebaseService.firestore.collection(this.collectionName).doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists || docSnap.data()?.userId !== userId) {
      return null;
    }
    return { id: docSnap.id, ...docSnap.data() } as GamePlan;
  }

  async update(userId: string, id: string, datos: any): Promise<GamePlan | null> {
    const docRef = this.firebaseService.firestore.collection(this.collectionName).doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists || docSnap.data()?.userId !== userId) {
      return null;
    }

    const dataToUpdate = { ...datos };
    Object.keys(dataToUpdate).forEach(
      key => dataToUpdate[key] === undefined && delete dataToUpdate[key]
    );

    await docRef.update(dataToUpdate);
    const updatedSnap = await docRef.get();
    return { id: updatedSnap.id, ...updatedSnap.data() } as GamePlan;
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
