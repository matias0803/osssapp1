import { Injectable, OnModuleInit, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { getAuth } from 'firebase-admin/auth';
import { FirebaseService } from '../firebase/firebase.service';
import { UsuarioPerfil } from './entities/usuario-perfil.entity';
import { SolicitudAmistad } from './entities/solicitud-amistad.entity';
import { TecnicaCompartida, TecnicaSnapshot } from './entities/tecnica-compartida.entity';
import { EnviarSolicitudDto } from './dto/enviar-solicitud.dto';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { CompartirTecnicasDto } from './dto/compartir-tecnicas.dto';

@Injectable()
export class SocialService implements OnModuleInit {
  private readonly coleccionUsuarios = 'usuarios';
  private readonly coleccionSolicitudes = 'solicitudes_amistad';
  private readonly coleccionAmistades = 'amistades';
  private readonly coleccionCompartidas = 'tecnicas_compartidas';
  private readonly coleccionTecnicas = 'tecnicas';
  private readonly coleccionEntrenamientos = 'entrenamientos';

  constructor(private readonly firebaseService: FirebaseService) {}

  async onModuleInit() {
    // Sincronizar automáticamente usuarios existentes de Firebase Auth a Firestore
    this.sincronizarUsuariosDeAuth().catch(err => {
      console.warn('[SocialService] Advertencia en sincronización inicial de usuarios:', err.message);
    });
  }

  private generarUsername(email: string, nombre?: string): string {
    const base = (email ? email.split('@')[0] : (nombre || 'luchador'))
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .substring(0, 20);
    return base || 'luchador';
  }

  private sanitizarFoto(foto?: string): string {
    if (!foto || foto.startsWith('http://') || foto.startsWith('https://') || foto.length > 8) {
      return '🥋';
    }
    return foto;
  }

  async sincronizarUsuariosDeAuth(): Promise<number> {
    try {
      const listResult = await getAuth().listUsers(1000);
      const snapshot = await this.firebaseService.firestore.collection(this.coleccionUsuarios).get();
      const existingUids = new Set(snapshot.docs.map(d => d.id));

      const batch = this.firebaseService.firestore.batch();
      let nuevosCount = 0;

      // 1. Agregar usuarios que estén en Auth pero no en Firestore
      for (const userRecord of listResult.users) {
        if (!existingUids.has(userRecord.uid)) {
          const docRef = this.firebaseService.firestore.collection(this.coleccionUsuarios).doc(userRecord.uid);
          const email = userRecord.email || '';
          const defaultNombre = userRecord.displayName || (email ? email.split('@')[0] : 'Luchador');
          const username = this.generarUsername(email, defaultNombre);
          const nuevoPerfil: UsuarioPerfil = {
            uid: userRecord.uid,
            email,
            nombre: defaultNombre,
            username,
            graduacion: 'Blanco',
            academia: '',
            foto: '🥋',
            creadoEn: new Date().toISOString(),
            actualizadoEn: new Date().toISOString(),
          };
          batch.set(docRef, nuevoPerfil);
          nuevosCount++;
        }
      }

      // 2. Asegurarnos que todos los documentos existentes tengan username y foto válida (emoji)
      for (const doc of snapshot.docs) {
        const d = doc.data();
        let needsUpdate = false;
        const updates: any = {};
        if (!d.username) {
          updates.username = this.generarUsername(d.email || '', d.nombre);
          needsUpdate = true;
        }
        if (!d.foto || d.foto.startsWith('http') || d.foto.length > 8) {
          updates.foto = '🥋';
          needsUpdate = true;
        }
        if (needsUpdate) {
          batch.update(doc.ref, updates);
          nuevosCount++;
        }
      }

      if (nuevosCount > 0) {
        await batch.commit();
        console.log(`[SocialService] Sincronizados/actualizados ${nuevosCount} usuario(s) en Firestore.`);
      }

      return nuevosCount;
    } catch (err: any) {
      console.warn('[SocialService] No se pudieron sincronizar usuarios de Auth:', err.message);
      return 0;
    }
  }

  private getAmistadDocId(uid1: string, uid2: string): string {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  }

  // --- 1. Perfiles ---
  async getOrSyncPerfil(userToken: any): Promise<UsuarioPerfil> {
    const uid = userToken.uid;
    const docRef = this.firebaseService.firestore.collection(this.coleccionUsuarios).doc(uid);
    const snap = await docRef.get();

    const email = userToken.email || '';
    const defaultNombre = userToken.name || (email ? email.split('@')[0] : 'Luchador');

    if (snap.exists) {
      const data = snap.data()!;
      let needsUpdate = false;
      const updates: any = {};
      if (!data.username) {
        updates.username = this.generarUsername(data.email || email, data.nombre || defaultNombre);
        needsUpdate = true;
      }
      if (!data.foto || data.foto.startsWith('http') || data.foto.length > 8) {
        updates.foto = '🥋';
        needsUpdate = true;
      }
      if (!data.email && email) {
        updates.email = email;
        needsUpdate = true;
      }
      if (needsUpdate) {
        updates.actualizadoEn = new Date().toISOString();
        await docRef.update(updates);
        return { uid, ...data, ...updates } as UsuarioPerfil;
      }
      return { uid, ...data } as UsuarioPerfil;
    }

    const username = this.generarUsername(email, defaultNombre);
    const nuevoPerfil: UsuarioPerfil = {
      uid,
      email,
      nombre: defaultNombre,
      username,
      graduacion: 'Blanco',
      academia: '',
      foto: '🥋',
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    };

    await docRef.set(nuevoPerfil);
    return nuevoPerfil;
  }

  async updatePerfil(userId: string, dto: ActualizarPerfilDto): Promise<UsuarioPerfil> {
    const docRef = this.firebaseService.firestore.collection(this.coleccionUsuarios).doc(userId);
    const snap = await docRef.get();

    if (!snap.exists) {
      throw new NotFoundException('Perfil de usuario no encontrado.');
    }

    const updates: any = { actualizadoEn: new Date().toISOString() };
    if (dto.nombre !== undefined) updates.nombre = dto.nombre.trim();
    if (dto.graduacion !== undefined) updates.graduacion = dto.graduacion.trim();
    if (dto.academia !== undefined) updates.academia = dto.academia.trim();
    if (dto.foto !== undefined) updates.foto = this.sanitizarFoto(dto.foto);

    if (dto.username !== undefined) {
      const cleanUsername = dto.username.trim().toLowerCase().replace(/^@/, '').replace(/[^a-z0-9._]/g, '');
      if (cleanUsername.length < 3) {
        throw new BadRequestException('El nombre de usuario debe tener al menos 3 caracteres.');
      }
      // Verificar unicidad de username
      const existingUserSnap = await this.firebaseService.firestore
        .collection(this.coleccionUsuarios)
        .where('username', '==', cleanUsername)
        .limit(1)
        .get();

      if (!existingUserSnap.empty && existingUserSnap.docs[0].id !== userId) {
        throw new BadRequestException(`El usuario @${cleanUsername} ya está en uso. Por favor elige otro.`);
      }
      updates.username = cleanUsername;
    }

    await docRef.update(updates);
    const updatedSnap = await docRef.get();
    return { uid: userId, ...updatedSnap.data() } as UsuarioPerfil;
  }

  async buscarUsuarios(userId: string, queryText?: string): Promise<any[]> {
    const queryClean = (queryText || '').trim().toLowerCase().replace(/^@/, '');
    if (!queryClean || queryClean.length < 2) {
      return [];
    }

    // Buscamos usuarios existentes en Firestore
    const snapshot = await this.firebaseService.firestore.collection(this.coleccionUsuarios).get();
    const todos = snapshot.docs
      .map(d => ({ uid: d.id, ...d.data() } as UsuarioPerfil))
      .filter(u => u.uid !== userId);

    const filtrados = todos.filter(u => {
      const usernameMatch = u.username && u.username.toLowerCase().includes(queryClean);
      const nombreMatch = u.nombre && u.nombre.toLowerCase().includes(queryClean);
      return usernameMatch || nombreMatch;
    }).slice(0, 15);

    if (filtrados.length === 0) return [];

    // Verificamos relaciones de amistad y solicitudes existentes
    const amistadesSnap = await this.firebaseService.firestore
      .collection(this.coleccionAmistades)
      .where('usuarios', 'array-contains', userId)
      .get();
    const amigosIds = new Set(
      amistadesSnap.docs.flatMap(d => (d.data().usuarios as string[]).filter(id => id !== userId))
    );

    const solicitudesSnap = await this.firebaseService.firestore
      .collection(this.coleccionSolicitudes)
      .where('estado', '==', 'pendiente')
      .get();

    return filtrados.map(target => {
      let estadoRelacion: 'amigo' | 'solicitud_enviada' | 'solicitud_recibida' | 'ninguno' = 'ninguno';
      let solicitudId: string | undefined = undefined;

      if (amigosIds.has(target.uid)) {
        estadoRelacion = 'amigo';
      } else {
        const solEnviada = solicitudesSnap.docs.find(d => {
          const data = d.data();
          return data.remitenteId === userId && data.destinatarioId === target.uid;
        });
        if (solEnviada) {
          estadoRelacion = 'solicitud_enviada';
          solicitudId = solEnviada.id;
        } else {
          const solRecibida = solicitudesSnap.docs.find(d => {
            const data = d.data();
            return data.remitenteId === target.uid && data.destinatarioId === userId;
          });
          if (solRecibida) {
            estadoRelacion = 'solicitud_recibida';
            solicitudId = solRecibida.id;
          }
        }
      }

      return {
        uid: target.uid,
        username: target.username || this.generarUsername(target.email, target.nombre),
        nombre: target.nombre,
        foto: this.sanitizarFoto(target.foto),
        graduacion: target.graduacion || 'Blanco',
        academia: target.academia || '',
        estadoRelacion,
        solicitudId,
      };
    });
  }

  // --- 2. Solicitudes y Amistades ---
  async enviarSolicitud(userToken: any, dto: EnviarSolicitudDto): Promise<SolicitudAmistad> {
    const remitenteId = userToken.uid;
    const remitentePerfil = await this.getOrSyncPerfil(userToken);

    let destinatarioPerfil: UsuarioPerfil | null = null;

    if (dto.destinatarioId) {
      if (dto.destinatarioId === remitenteId) {
        throw new BadRequestException('No puedes enviarte una solicitud a ti mismo.');
      }
      const doc = await this.firebaseService.firestore.collection(this.coleccionUsuarios).doc(dto.destinatarioId).get();
      if (doc.exists) {
        destinatarioPerfil = { uid: doc.id, ...doc.data() } as UsuarioPerfil;
      }
    } else if (dto.destinatarioUsername) {
      const cleanTarget = dto.destinatarioUsername.trim().toLowerCase().replace(/^@/, '');
      if (cleanTarget === (remitentePerfil.username || '').toLowerCase()) {
        throw new BadRequestException('No puedes enviarte una solicitud a ti mismo.');
      }
      const snap = await this.firebaseService.firestore
        .collection(this.coleccionUsuarios)
        .where('username', '==', cleanTarget)
        .limit(1)
        .get();

      if (!snap.empty) {
        destinatarioPerfil = { uid: snap.docs[0].id, ...snap.docs[0].data() } as UsuarioPerfil;
      }
    } else if (dto.destinatarioEmail) {
      const emailTarget = dto.destinatarioEmail.trim().toLowerCase();
      if (emailTarget === (remitentePerfil.email || '').toLowerCase()) {
        throw new BadRequestException('No puedes enviarte una solicitud a ti mismo.');
      }
      const snap = await this.firebaseService.firestore
        .collection(this.coleccionUsuarios)
        .where('email', '==', emailTarget)
        .limit(1)
        .get();

      if (!snap.empty) {
        destinatarioPerfil = { uid: snap.docs[0].id, ...snap.docs[0].data() } as UsuarioPerfil;
      }
    } else {
      throw new BadRequestException('Debes indicar el @usuario o identificador del destinatario.');
    }

    if (!destinatarioPerfil) {
      throw new NotFoundException('No se encontró ningún usuario con ese @nombre de usuario.');
    }

    const destinatarioId = destinatarioPerfil.uid;

    // Verificar si ya son amigos
    const amistadId = this.getAmistadDocId(remitenteId, destinatarioId);
    const amistadSnap = await this.firebaseService.firestore.collection(this.coleccionAmistades).doc(amistadId).get();
    if (amistadSnap.exists) {
      throw new BadRequestException('Ya eres amigo de este usuario.');
    }

    // Verificar si ya existe solicitud pendiente en cualquier dirección
    const solicitudesSnap = await this.firebaseService.firestore
      .collection(this.coleccionSolicitudes)
      .where('estado', '==', 'pendiente')
      .get();

    const yaExiste = solicitudesSnap.docs.some(d => {
      const data = d.data();
      return (
        (data.remitenteId === remitenteId && data.destinatarioId === destinatarioId) ||
        (data.remitenteId === destinatarioId && data.destinatarioId === remitenteId)
      );
    });

    if (yaExiste) {
      throw new BadRequestException('Ya existe una solicitud pendiente con este usuario.');
    }

    const docRef = this.firebaseService.firestore.collection(this.coleccionSolicitudes).doc();
    const nuevaSolicitud: SolicitudAmistad = {
      id: docRef.id,
      remitenteId,
      remitenteEmail: remitentePerfil.email,
      remitenteNombre: remitentePerfil.nombre,
      remitenteUsername: remitentePerfil.username || this.generarUsername(remitentePerfil.email, remitentePerfil.nombre),
      remitenteFoto: remitentePerfil.foto || '🥋',
      destinatarioId,
      destinatarioEmail: destinatarioPerfil.email,
      destinatarioNombre: destinatarioPerfil.nombre,
      destinatarioUsername: destinatarioPerfil.username || this.generarUsername(destinatarioPerfil.email, destinatarioPerfil.nombre),
      destinatarioFoto: destinatarioPerfil.foto || '🥋',
      estado: 'pendiente',
      fecha: new Date().toISOString(),
    };

    await docRef.set(nuevaSolicitud);
    return nuevaSolicitud;
  }

  async getSolicitudes(userId: string): Promise<{ recibidas: SolicitudAmistad[]; enviadas: SolicitudAmistad[] }> {
    const recibidasSnap = await this.firebaseService.firestore
      .collection(this.coleccionSolicitudes)
      .where('destinatarioId', '==', userId)
      .where('estado', '==', 'pendiente')
      .get();

    const enviadasSnap = await this.firebaseService.firestore
      .collection(this.coleccionSolicitudes)
      .where('remitenteId', '==', userId)
      .where('estado', '==', 'pendiente')
      .get();

    const recibidas = recibidasSnap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        remitenteUsername: data.remitenteUsername || this.generarUsername(data.remitenteEmail, data.remitenteNombre),
        remitenteFoto: data.remitenteFoto || '🥋',
      } as SolicitudAmistad;
    });
    const enviadas = enviadasSnap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        destinatarioUsername: data.destinatarioUsername || this.generarUsername(data.destinatarioEmail, data.destinatarioNombre),
        destinatarioFoto: data.destinatarioFoto || '🥋',
      } as SolicitudAmistad;
    });

    return { recibidas, enviadas };
  }

  async responderSolicitud(userId: string, solicitudId: string, accion: 'aceptar' | 'rechazar'): Promise<any> {
    const docRef = this.firebaseService.firestore.collection(this.coleccionSolicitudes).doc(solicitudId);
    const snap = await docRef.get();

    if (!snap.exists) {
      throw new NotFoundException('Solicitud no encontrada.');
    }

    const solicitud = snap.data() as SolicitudAmistad;
    if (solicitud.destinatarioId !== userId) {
      throw new ForbiddenException('No tienes permiso para responder esta solicitud.');
    }

    if (solicitud.estado !== 'pendiente') {
      throw new BadRequestException('Esta solicitud ya fue respondida.');
    }

    if (accion === 'rechazar') {
      await docRef.update({ estado: 'rechazada' });
      return { mensaje: 'Solicitud rechazada con éxito.' };
    }

    // Aceptar: Crear vínculo en colección 'amistades'
    await docRef.update({ estado: 'aceptada' });
    const amistadId = this.getAmistadDocId(solicitud.remitenteId, solicitud.destinatarioId);
    const amistadDocRef = this.firebaseService.firestore.collection(this.coleccionAmistades).doc(amistadId);

    await amistadDocRef.set({
      usuarios: [solicitud.remitenteId, solicitud.destinatarioId],
      usuario1Id: solicitud.remitenteId < solicitud.destinatarioId ? solicitud.remitenteId : solicitud.destinatarioId,
      usuario2Id: solicitud.remitenteId < solicitud.destinatarioId ? solicitud.destinatarioId : solicitud.remitenteId,
      fecha: new Date().toISOString(),
    });

    return { mensaje: '¡Solicitud aceptada! Ahora son amigos en osssApp.' };
  }

  async getAmigos(userId: string): Promise<any[]> {
    const snapshot = await this.firebaseService.firestore
      .collection(this.coleccionAmistades)
      .where('usuarios', 'array-contains', userId)
      .get();

    if (snapshot.empty) {
      return [];
    }

    const amigosIds = snapshot.docs.map(doc => {
      const data = doc.data();
      return (data.usuarios as string[]).find(id => id !== userId)!;
    });

    // Cargar perfiles de amigos y total de entrenamientos para cada uno
    const amigosData = await Promise.all(
      amigosIds.map(async (amigoId) => {
        const perfilSnap = await this.firebaseService.firestore.collection(this.coleccionUsuarios).doc(amigoId).get();
        const perfil = perfilSnap.exists ? perfilSnap.data()! : { nombre: 'Amigo', email: '' };

        const entrenamientosCountSnap = await this.firebaseService.firestore
          .collection(this.coleccionEntrenamientos)
          .where('userId', '==', amigoId)
          .get();

        return {
          uid: amigoId,
          nombre: perfil.nombre || 'Compañero de Tatami',
          username: perfil.username || this.generarUsername(perfil.email, perfil.nombre),
          foto: this.sanitizarFoto(perfil.foto),
          graduacion: perfil.graduacion || 'Blanco',
          academia: perfil.academia || '',
          totalEntrenamientos: entrenamientosCountSnap.size,
        };
      })
    );

    return amigosData;
  }

  async eliminarAmigo(userId: string, amigoId: string): Promise<any> {
    const amistadId = this.getAmistadDocId(userId, amigoId);
    const docRef = this.firebaseService.firestore.collection(this.coleccionAmistades).doc(amistadId);
    const snap = await docRef.get();

    if (!snap.exists) {
      throw new NotFoundException('No existe relación de amistad con este usuario.');
    }

    await docRef.delete();
    return { mensaje: 'Amigo eliminado correctamente.' };
  }

  // --- 3. Perfil de Amigo y Resumen de Entrenamientos ---
  async getPerfilAmigo(userId: string, amigoId: string): Promise<any> {
    // 1. Validar que sean amigos
    const amistadId = this.getAmistadDocId(userId, amigoId);
    const amistadSnap = await this.firebaseService.firestore.collection(this.coleccionAmistades).doc(amistadId).get();
    if (!amistadSnap.exists) {
      throw new ForbiddenException('Debes ser amigo de este usuario para ver el resumen de sus entrenamientos.');
    }

    // 2. Cargar perfil
    const perfilSnap = await this.firebaseService.firestore.collection(this.coleccionUsuarios).doc(amigoId).get();
    if (!perfilSnap.exists) {
      throw new NotFoundException('Perfil del amigo no encontrado.');
    }
    const perfil = perfilSnap.data()!;

    // 3. Cargar entrenamientos
    const entrenamientosSnap = await this.firebaseService.firestore
      .collection(this.coleccionEntrenamientos)
      .where('userId', '==', amigoId)
      .get();

    const entrenamientos = entrenamientosSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fecha: data.fecha,
      };
    }) as any[];

    // 4. Calcular Métricas y Resumen
    const totalEntrenamientos = entrenamientos.length;
    const giEntrenamientos = entrenamientos.filter(e => e.gi).length;
    const nogiEntrenamientos = totalEntrenamientos - giEntrenamientos;

    // Calcular días únicos entrenados
    const uniqueDates = new Set(
      entrenamientos.map(e => (typeof e.fecha === 'string' ? e.fecha.substring(0, 10) : ''))
    );
    uniqueDates.delete('');

    // Calcular Puntos Ciegos / Posiciones recurrentes
    const posicionesCounts: Record<string, number> = {};
    entrenamientos.forEach(e => {
      if (e.posicionAtrapado && typeof e.posicionAtrapado === 'string') {
        const pos = e.posicionAtrapado.trim();
        posicionesCounts[pos] = (posicionesCounts[pos] || 0) + 1;
      }
    });

    let puntoCiego: { posicion: string; count: number } | null = null;
    let maxPosCount = 0;
    Object.entries(posicionesCounts).forEach(([pos, count]) => {
      if (count > maxPosCount) {
        maxPosCount = count;
        puntoCiego = { posicion: pos, count };
      }
    });

    // Últimos entrenamientos (ordenados por fecha descendente, máximo 10)
    const ultimosEntrenamientos = [...entrenamientos]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 10)
      .map(e => ({
        id: e.id,
        fecha: e.fecha,
        objetivo: e.objetivo,
        gi: e.gi,
        repeticionesEfectivas: e.repeticionesEfectivas || null,
        posicionAtrapado: e.posicionAtrapado || null,
        temaClase: e.temaClase || null,
      }));

    // Cargar total de técnicas del amigo
    const tecnicasSnap = await this.firebaseService.firestore
      .collection(this.coleccionTecnicas)
      .where('userId', '==', amigoId)
      .get();

    return {
      usuario: {
        uid: amigoId,
        nombre: perfil.nombre || 'Compañero de Tatami',
        username: perfil.username || this.generarUsername(perfil.email, perfil.nombre),
        foto: this.sanitizarFoto(perfil.foto),
        graduacion: perfil.graduacion || 'Blanco',
        academia: perfil.academia || '',
      },
      resumen: {
        totalEntrenamientos,
        giEntrenamientos,
        nogiEntrenamientos,
        totalDiasEntrenados: uniqueDates.size,
        totalTecnicas: tecnicasSnap.size,
        puntoCiego,
        ultimosEntrenamientos,
      },
    };
  }

  // --- 4. Compartir N Técnicas ---
  async compartirTecnicas(userId: string, userToken: any, amigoId: string, dto: CompartirTecnicasDto): Promise<any> {
    // 1. Validar amistad
    const amistadId = this.getAmistadDocId(userId, amigoId);
    const amistadSnap = await this.firebaseService.firestore.collection(this.coleccionAmistades).doc(amistadId).get();
    if (!amistadSnap.exists) {
      throw new ForbiddenException('Solo puedes compartir técnicas con tus amigos agregados.');
    }

    // 2. Obtener perfiles
    const remitentePerfil = await this.getOrSyncPerfil(userToken);
    const destinatarioDoc = await this.firebaseService.firestore.collection(this.coleccionUsuarios).doc(amigoId).get();
    if (!destinatarioDoc.exists) {
      throw new NotFoundException('El amigo destinatario no existe.');
    }
    const destinatarioPerfil = destinatarioDoc.data()!;

    // 3. Obtener técnicas del usuario
    const tecnicasSnap = await this.firebaseService.firestore
      .collection(this.coleccionTecnicas)
      .where('userId', '==', userId)
      .get();

    const misTecnicas = tecnicasSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const idsSet = new Set(dto.tecnicaIds);
    const tecnicasACompartir = misTecnicas.filter(t => idsSet.has(t.id));

    if (tecnicasACompartir.length === 0) {
      throw new BadRequestException('No se encontró ninguna de las técnicas seleccionadas en tu biblioteca.');
    }

    // 4. Crear snapshots de las técnicas
    const snapshots: TecnicaSnapshot[] = tecnicasACompartir.map((t: any) => ({
      id: t.id,
      nombre: t.nombre,
      nota: t.nota || '',
      gi: t.gi !== undefined ? t.gi : (t.modalidad === 'gi'),
      modalidad: t.modalidad || (t.gi !== false ? 'gi' : 'nogi'),
      tag: t.tag || [],
      videoUrl: t.videoUrl || null,
      conexiones: t.conexiones || [],
    }));

    // 5. Guardar paquete compartido
    const docRef = this.firebaseService.firestore.collection(this.coleccionCompartidas).doc();
    const paqueteCompartido: TecnicaCompartida = {
      id: docRef.id,
      remitenteId: userId,
      remitenteEmail: remitentePerfil.email,
      remitenteNombre: remitentePerfil.nombre,
      remitenteUsername: remitentePerfil.username || this.generarUsername(remitentePerfil.email, remitentePerfil.nombre),
      remitenteFoto: remitentePerfil.foto || '🥋',
      destinatarioId: amigoId,
      destinatarioEmail: destinatarioPerfil.email || '',
      destinatarioNombre: destinatarioPerfil.nombre || 'Amigo',
      destinatarioUsername: destinatarioPerfil.username || this.generarUsername(destinatarioPerfil.email, destinatarioPerfil.nombre),
      destinatarioFoto: destinatarioPerfil.foto || '🥋',
      fecha: new Date().toISOString(),
      nota: dto.nota?.trim() || '',
      tecnicas: snapshots,
      importada: false,
    };

    await docRef.set(paqueteCompartido);
    return {
      mensaje: `¡Se compartieron con éxito ${snapshots.length} técnica(s) con ${destinatarioPerfil.nombre || 'tu amigo'}!`,
      paqueteId: docRef.id,
      totalCompartidas: snapshots.length,
    };
  }

  async getTecnicasCompartidas(userId: string): Promise<{ recibidas: TecnicaCompartida[]; enviadas: TecnicaCompartida[] }> {
    const recibidasSnap = await this.firebaseService.firestore
      .collection(this.coleccionCompartidas)
      .where('destinatarioId', '==', userId)
      .get();

    const enviadasSnap = await this.firebaseService.firestore
      .collection(this.coleccionCompartidas)
      .where('remitenteId', '==', userId)
      .get();

    const recibidas = recibidasSnap.docs
      .map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          remitenteUsername: data.remitenteUsername || this.generarUsername(data.remitenteEmail, data.remitenteNombre),
          remitenteFoto: data.remitenteFoto || '🥋',
        } as TecnicaCompartida;
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    const enviadas = enviadasSnap.docs
      .map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          destinatarioUsername: data.destinatarioUsername || this.generarUsername(data.destinatarioEmail, data.destinatarioNombre),
          destinatarioFoto: data.destinatarioFoto || '🥋',
        } as TecnicaCompartida;
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    return { recibidas, enviadas };
  }

  async importarTecnicas(userId: string, paqueteId: string): Promise<any> {
    const docRef = this.firebaseService.firestore.collection(this.coleccionCompartidas).doc(paqueteId);
    const snap = await docRef.get();

    if (!snap.exists) {
      throw new NotFoundException('Paquete de técnicas compartidas no encontrado.');
    }

    const paquete = snap.data() as TecnicaCompartida;
    if (paquete.destinatarioId !== userId) {
      throw new ForbiddenException('No tienes permiso para importar este paquete.');
    }

    const remitenteNombre = paquete.remitenteNombre || 'un compañero';
    let importadasCount = 0;

    for (const t of paquete.tecnicas) {
      const nuevaTecnicaRef = this.firebaseService.firestore.collection(this.coleccionTecnicas).doc();
      const notaFinal = t.nota
        ? `${t.nota}\n\n🥋 Compartida por ${remitenteNombre}`
        : `🥋 Compartida por ${remitenteNombre}`;

      const tags = Array.from(new Set([...(t.tag || []), 'compartida']));

      const nuevaTecnica = {
        userId,
        nombre: t.nombre,
        nota: notaFinal,
        gi: t.gi !== undefined ? t.gi : (t.modalidad === 'gi'),
        modalidad: t.modalidad || (t.gi !== false ? 'gi' : 'nogi'),
        tag: tags,
        videoUrl: t.videoUrl || null,
        conexiones: t.conexiones || [],
      };

      await nuevaTecnicaRef.set(nuevaTecnica);
      importadasCount++;
    }

    await docRef.update({ importada: true });

    return {
      mensaje: `Se importaron ${importadasCount} técnica(s) correctamente a tu biblioteca.`,
      importadasCount,
    };
  }
}
