import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { EntrenamientosService } from './entrenamientos.service';
import { CreateEntrenamientoDto } from './dto/create-entrenamiento.dto';
import { UpdateEntrenamientoDto } from './dto/update-entrenamiento.dto';
import { filter } from 'rxjs';
import { FilterEntrenamientoDto } from './dto/filter-entrenamiento.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { User } from '../auth/user.decorator';

@UseGuards(FirebaseAuthGuard)
@Controller('entrenamientos')
export class EntrenamientosController {
  constructor(private readonly entrenamientosService: EntrenamientosService) {}

  @Post()
  create(@User() user: any, @Body() createEntrenamientoDto: CreateEntrenamientoDto) {
    return this.entrenamientosService.create(user.uid, createEntrenamientoDto);
  }

  @Get()
  findAll(@User() user: any, @Query() filter: FilterEntrenamientoDto) {
    return this.entrenamientosService.findAll(user.uid, filter);
  }

  @Get(':id')
  findOne(@User() user: any, @Param('id') id: string) {
    return this.entrenamientosService.findOne(user.uid, id);
  }

  @Patch(':id')
  update(@User() user: any, @Param('id') id: string, @Body() updateEntrenamientoDto: UpdateEntrenamientoDto) {
    return this.entrenamientosService.update(user.uid, id, updateEntrenamientoDto);
  }

  @Delete(':id')
  remove(@User() user: any, @Param('id') id: string) {
    return this.entrenamientosService.remove(user.uid, id);
  }
}
