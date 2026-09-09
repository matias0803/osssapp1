import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SocialService } from './social.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { User } from '../auth/user.decorator';
import { EnviarSolicitudDto } from './dto/enviar-solicitud.dto';
import { ResponderSolicitudDto } from './dto/responder-solicitud.dto';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { CompartirTecnicasDto } from './dto/compartir-tecnicas.dto';

@UseGuards(FirebaseAuthGuard)
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('perfil')
  getPerfil(@User() user: any) {
    return this.socialService.getOrSyncPerfil(user);
  }

  @Put('perfil')
  updatePerfil(@User() user: any, @Body() dto: ActualizarPerfilDto) {
    return this.socialService.updatePerfil(user.uid, dto);
  }

  @Get('usuarios/buscar')
  buscarUsuarios(@User() user: any, @Query('q') q?: string) {
    return this.socialService.buscarUsuarios(user.uid, q);
  }

  @Get('amigos')
  getAmigos(@User() user: any) {
    return this.socialService.getAmigos(user.uid);
  }

  @Delete('amigos/:amigoId')
  eliminarAmigo(@User() user: any, @Param('amigoId') amigoId: string) {
    return this.socialService.eliminarAmigo(user.uid, amigoId);
  }

  @Get('amigos/:amigoId/perfil')
  getPerfilAmigo(@User() user: any, @Param('amigoId') amigoId: string) {
    return this.socialService.getPerfilAmigo(user.uid, amigoId);
  }

  @Post('amigos/:amigoId/compartir-tecnicas')
  compartirTecnicas(
    @User() user: any,
    @Param('amigoId') amigoId: string,
    @Body() dto: CompartirTecnicasDto,
  ) {
    return this.socialService.compartirTecnicas(user.uid, user, amigoId, dto);
  }

  @Get('solicitudes')
  getSolicitudes(@User() user: any) {
    return this.socialService.getSolicitudes(user.uid);
  }

  @Post('solicitudes')
  enviarSolicitud(@User() user: any, @Body() dto: EnviarSolicitudDto) {
    return this.socialService.enviarSolicitud(user, dto);
  }

  @Post('solicitudes/:id/responder')
  responderSolicitud(
    @User() user: any,
    @Param('id') id: string,
    @Body() dto: ResponderSolicitudDto,
  ) {
    return this.socialService.responderSolicitud(user.uid, id, dto.accion);
  }

  @Get('tecnicas-compartidas')
  getTecnicasCompartidas(@User() user: any) {
    return this.socialService.getTecnicasCompartidas(user.uid);
  }

  @Post('tecnicas-compartidas/:id/importar')
  importarTecnicas(@User() user: any, @Param('id') id: string) {
    return this.socialService.importarTecnicas(user.uid, id);
  }
}
