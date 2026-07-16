import { CreateGamePlanDto } from './dto/create-gameplan.dto';
import { GamePlan } from './entities/gameplan.entity';

export abstract class GamePlansRepository {
  abstract create(userId: string, createDto: CreateGamePlanDto): Promise<GamePlan>;
  abstract findAll(userId: string): Promise<GamePlan[]>;
  abstract findOne(userId: string, id: string): Promise<GamePlan | null>;
  abstract update(userId: string, id: string, updateDto: any): Promise<GamePlan | null>;
  abstract remove(userId: string, id: string): Promise<boolean>;
}
