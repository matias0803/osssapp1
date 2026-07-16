import { Injectable, NotFoundException } from '@nestjs/common';
import { GamePlan } from './entities/gameplan.entity';
import { CreateGamePlanDto } from './dto/create-gameplan.dto';

@Injectable()
export class GamePlansMemoryRepository {
  private gameplans: GamePlan[] = [
    { id: '1', titulo: 'Rutina Guardiero', tecnicasIds: [] },
  ];

  async findAll(userId: string): Promise<GamePlan[]> {
    return this.gameplans.filter(g => g.userId === userId);
  }

  async findOne(userId: string, id: string): Promise<GamePlan> {
    const gp = this.gameplans.find(g => g.id === id && g.userId === userId);
    if (!gp) throw new NotFoundException(`GamePlan ${id} no encontrado`);
    return gp;
  }

  async create(userId: string, createDto: CreateGamePlanDto): Promise<GamePlan> {
    const gp: GamePlan = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      ...createDto,
    };
    this.gameplans.push(gp);
    return gp;
  }

  async update(userId: string, id: string, updateDto: any): Promise<GamePlan> {
    const index = this.gameplans.findIndex(g => g.id === id && g.userId === userId);
    if (index === -1) throw new NotFoundException(`GamePlan ${id} no encontrado`);
    
    this.gameplans[index] = { ...this.gameplans[index], ...updateDto };
    return this.gameplans[index];
  }

  async remove(userId: string, id: string): Promise<void> {
    const index = this.gameplans.findIndex(g => g.id === id && g.userId === userId);
    if (index === -1) throw new NotFoundException(`GamePlan ${id} no encontrado`);
    this.gameplans.splice(index, 1);
  }
}
