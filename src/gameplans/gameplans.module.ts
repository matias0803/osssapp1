import { Module } from '@nestjs/common';
import { GamePlansController } from './gameplans.controller';
import { GamePlansService } from './gameplans.service';
import { GamePlansRepository } from './gameplans.repository';
import { GamePlansFirebaseRepository } from './gameplans-firebase.repository';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [GamePlansController],
  providers: [
    GamePlansService,
    {
      provide: GamePlansRepository,
      useClass: GamePlansFirebaseRepository,
    }
  ],
})
export class GameplansModule {}
