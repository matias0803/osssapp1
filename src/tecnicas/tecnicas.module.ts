import { Module } from '@nestjs/common';
import { TecnicasService } from './tecnicas.service';
import { TecnicasController } from './tecnicas.controller';
import { TecnicasRepository } from './tecnicas.repository';
import { TecnicasFirebaseRepository } from './tecnicas-firebase.repository';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [TecnicasController],
  providers: [
    TecnicasService,
    {
      // La regla de inyección:
      provide: TecnicasRepository,
      useClass: TecnicasFirebaseRepository,
    },
  ],
})
export class TecnicasModule {}
