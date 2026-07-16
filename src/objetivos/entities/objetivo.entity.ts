export class Objetivo {
  id!: string; // Antes era number
  userId?: string;
  titulo!: string;
  tipo!: string;
  completado!: boolean;
  fechaCreacion!: string;
}