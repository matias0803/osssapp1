export class SolicitudAmistad {
  id!: string;
  remitenteId!: string;
  remitenteEmail!: string;
  remitenteNombre!: string;
  remitenteUsername?: string;
  remitenteFoto?: string;
  destinatarioId!: string;
  destinatarioEmail!: string;
  destinatarioNombre?: string;
  destinatarioUsername?: string;
  destinatarioFoto?: string;
  estado!: 'pendiente' | 'aceptada' | 'rechazada';
  fecha!: string;
}
