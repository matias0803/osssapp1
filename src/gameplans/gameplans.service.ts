import { Injectable } from '@nestjs/common';
import { GamePlansRepository } from './gameplans.repository';
import { CreateGamePlanDto } from './dto/create-gameplan.dto';
import { GamePlan } from './entities/gameplan.entity';

@Injectable()
export class GamePlansService {
  constructor(private readonly repo: GamePlansRepository) {}

  async findAll(userId: string): Promise<GamePlan[]> {
    return this.repo.findAll(userId);
  }

  async findOne(userId: string, id: string): Promise<GamePlan | null> {
    return this.repo.findOne(userId, id);
  }

  async create(userId: string, createDto: CreateGamePlanDto): Promise<GamePlan> {
    return this.repo.create(userId, createDto);
  }

  async update(userId: string, id: string, updateDto: any): Promise<GamePlan | null> {
    return this.repo.update(userId, id, updateDto);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.repo.remove(userId, id);
  }
}
