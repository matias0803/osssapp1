import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TecnicasService } from './tecnicas.service';
import { CreateTecnicaDto } from './dto/create-tecnica.dto';
import { UpdateTecnicaDto } from './dto/update-tecnica.dto';
import { FilterTecnicaDto } from './dto/filter-tecnica.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { User } from '../auth/user.decorator';

@UseGuards(FirebaseAuthGuard)
@Controller('tecnicas')
export class TecnicasController {
  constructor(private readonly tecnicasService: TecnicasService) {}

  @Post()
  create(@User() user: any, @Body() createTecnicaDto: CreateTecnicaDto) {
    return this.tecnicasService.create(user.uid, createTecnicaDto);
  }

  @Get()
  findAll(@User() user: any, @Query() filterDto: FilterTecnicaDto) {
    return this.tecnicasService.findAll(user.uid, filterDto);
  }

  @Get(':id')
  findOne(@User() user: any, @Param('id') id: string) {
    return this.tecnicasService.findOne(user.uid, id);
  }

  @Patch(':id')
  update(@User() user: any, @Param('id') id: string, @Body() updateTecnicaDto: UpdateTecnicaDto) {
    return this.tecnicasService.update(user.uid, id, updateTecnicaDto);
  }

  @Delete(':id')
  remove(@User() user: any, @Param('id') id: string) {
    return this.tecnicasService.remove(user.uid, id);
  }
}
