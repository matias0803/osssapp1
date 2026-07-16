import { Module } from '@nestjs/common';
import { EntrenamientosService } from './entrenamientos.service';
import { EntrenamientosController } from './entrenamientos.controller';
import { EntrenamientosFirebaseRepository } from './entrenamientos-firebase.repository';
import { EntrenamientosRepository } from './entrenamientos.repository';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [EntrenamientosController],
  providers: [EntrenamientosService,
    {
          // La regla de inyección:
          provide: EntrenamientosRepository,
          useClass: EntrenamientosFirebaseRepository,
        },
  ],
})
export class EntrenamientosModule {}
