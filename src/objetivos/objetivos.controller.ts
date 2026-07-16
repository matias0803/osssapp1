import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ObjetivosService } from './objetivos.service';
import { CreateObjetivoDto } from './dto/create-objetivo.dto';
import { UpdateObjetivoDto } from './dto/update-objetivo.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { User } from '../auth/user.decorator';

@UseGuards(FirebaseAuthGuard)
@Controller('objetivos')
export class ObjetivosController {
  constructor(private readonly objetivosService: ObjetivosService) {}

  @Post()
  create(@User() user: any, @Body() createObjetivoDto: CreateObjetivoDto) {
    return this.objetivosService.create(user.uid, createObjetivoDto);
  }

  @Get()
  findAll(@User() user: any) {
    return this.objetivosService.findAll(user.uid);
  }

  @Get(':id')
  findOne(@User() user: any, @Param('id') id: string) {
    return this.objetivosService.findOne(user.uid, id);
  }

  @Patch(':id')
  update(@User() user: any, @Param('id') id: string, @Body() updateObjetivoDto: UpdateObjetivoDto) {
    return this.objetivosService.update(user.uid, id, updateObjetivoDto);
  }

  @Delete(':id')
  remove(@User() user: any, @Param('id') id: string) {
    return this.objetivosService.remove(user.uid, id);
  }
}
