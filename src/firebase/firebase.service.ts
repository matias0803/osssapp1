import { Injectable, OnModuleInit } from '@nestjs/common';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

@Injectable()
export class FirebaseService implements OnModuleInit {
  public firestore!: Firestore;

  onModuleInit() {
    // Verificamos si ya hay aplicaciones inicializadas
    if (getApps().length === 0) {
      // Soporte para Producción: Leer credenciales como Variables de Entorno separadas o String JSON
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          }),
        });
      } 
      // Soporte Local: Leer archivo JSON desde la ruta
      else if (process.env.FIREBASE_CREDENTIAL_PATH) {
        initializeApp({
          credential: cert(process.env.FIREBASE_CREDENTIAL_PATH), 
        });
      }
    }
    
    // Inicializamos la instancia de Firestore
    this.firestore = getFirestore();
  }
}