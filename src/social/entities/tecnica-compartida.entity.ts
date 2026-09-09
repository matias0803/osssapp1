export class TecnicaSnapshot {
  id?: string;
  nombre!: string;
  nota!: string;
  gi?: boolean;
  modalidad?: 'gi' | 'nogi' | 'ambos';
  tag?: string[];
  videoUrl?: string;
  conexiones?: string[];
}

export class TecnicaCompartida {
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
  fecha!: string;
  nota?: string;
  tecnicas!: TecnicaSnapshot[];
  importada!: boolean;
}
