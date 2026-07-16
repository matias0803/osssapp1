import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { GamePlansService } from './gameplans.service';
import { CreateGamePlanDto } from './dto/create-gameplan.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { User } from '../auth/user.decorator';

@UseGuards(FirebaseAuthGuard)
@Controller('gameplans')
export class GamePlansController {
  constructor(private readonly gameplansService: GamePlansService) {}

  @Get()
  findAll(@User() user: any) {
    return this.gameplansService.findAll(user.uid);
  }

  @Get(':id')
  findOne(@User() user: any, @Param('id') id: string) {
    return this.gameplansService.findOne(user.uid, id);
  }

  @Post()
  create(@User() user: any, @Body() createDto: CreateGamePlanDto) {
    return this.gameplansService.create(user.uid, createDto);
  }

  @Patch(':id')
  update(@User() user: any, @Param('id') id: string, @Body() updateDto: any) {
    return this.gameplansService.update(user.uid, id, updateDto);
  }

  @Delete(':id')
  remove(@User() user: any, @Param('id') id: string) {
    return this.gameplansService.remove(user.uid, id);
  }
}
