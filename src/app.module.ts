import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TecnicasModule } from './tecnicas/tecnicas.module';
import { EntrenamientosModule } from './entrenamientos/entrenamientos.module';
import { ObjetivosModule } from './objetivos/objetivos.module';
import { GameplansModule } from './gameplans/gameplans.module';
import { FirebaseModule } from './firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';
import { SocialModule } from './social/social.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TecnicasModule,
    EntrenamientosModule,
    ObjetivosModule,
    GameplansModule,
    FirebaseModule,
    SocialModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
