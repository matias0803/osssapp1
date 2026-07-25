export class Tecnica {
  id!: string;
  userId?: string;
  nombre!: string;  
  nota!: string;
  gi?: boolean;
  modalidad?: 'gi' | 'nogi' | 'ambos';
  tag!: string[];
  videoUrl?: string;
  conexiones?: string[];
}