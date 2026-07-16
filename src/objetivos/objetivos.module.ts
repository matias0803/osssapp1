import { Module } from '@nestjs/common';
import { ObjetivosService } from './objetivos.service';
import { ObjetivosController } from './objetivos.controller';
// 1. Importa el módulo de Firebase (verifica que la ruta sea correcta)
import { FirebaseModule } from '../firebase/firebase.module'; 

@Module({
  // 2. Agrégalo al arreglo de imports
  imports: [FirebaseModule], 
  controllers: [ObjetivosController],
  providers: [ObjetivosService],
})
export class ObjetivosModule {}