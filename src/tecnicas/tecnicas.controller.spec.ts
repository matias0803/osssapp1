import { Test, TestingModule } from '@nestjs/testing';
import { TecnicasController } from './tecnicas.controller';
import { TecnicasService } from './tecnicas.service';
import { TecnicasRepository } from './tecnicas.repository';
import { TecnicasMemoryRepository } from './tecnicas-memory.repository';
import { NotFoundException } from '@nestjs/common';

jest.mock('firebase-admin/auth', () => ({
  getAuth: () => ({
    verifyIdToken: jest.fn(),
  }),
}));

describe('TecnicasController', () => {
  let controller: TecnicasController;
  let service: TecnicasService;
  const mockUser = { uid: 'test-user', email: 'test@example.com' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TecnicasController],
      providers: [
        TecnicasService,
        {
          provide: TecnicasRepository,
          useClass: TecnicasMemoryRepository,
        },
      ],
    }).compile();

    controller = module.get<TecnicasController>(TecnicasController);
    service = module.get<TecnicasService>(TecnicasService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all tecnicas when no filters are applied', async () => {
      const result = await controller.findAll(mockUser, {});
      expect(result).toHaveLength(2);
      expect(result[0].nombre).toBe('Armbar Clásico');
    });

    it('should filter by nombre (case-insensitive)', async () => {
      const result = await controller.findAll(mockUser, { nombre: 'mata' });
      expect(result).toHaveLength(1);
      expect(result[0].nombre).toContain('Rear Naked Choke');
    });

    it('should filter by gi boolean', async () => {
      const resultGi = await controller.findAll(mockUser, { gi: true });
      expect(resultGi).toHaveLength(1);
      expect(resultGi[0].nombre).toBe('Armbar Clásico');

      const resultNoGi = await controller.findAll(mockUser, { gi: false });
      expect(resultNoGi).toHaveLength(1);
      expect(resultNoGi[0].nombre).toBe('Mata León (Rear Naked Choke)');
    });

    it('should filter by tag', async () => {
      const result = await controller.findAll(mockUser, { tag: 'espalda' });
      expect(result).toHaveLength(1);
      expect(result[0].nombre).toContain('Rear Naked Choke');
    });
  });

  describe('findOne', () => {
    it('should return a tecnica by ID', async () => {
      const result = await controller.findOne(mockUser, '1');
      expect(result).toBeDefined();
      expect(result?.nombre).toBe('Armbar Clásico');
    });

    it('should throw NotFoundException if id does not exist', async () => {
      await expect(controller.findOne(mockUser, '999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new tecnica', async () => {
      const dto = {
        nombre: 'Triángulo',
        nota: 'Cerrar el candado con la corva de la rodilla.',
        gi: true,
        tag: ['sumisión', 'guardia-abierta'],
      };
      const result = await controller.create(mockUser, dto);
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.nombre).toBe('Triángulo');
    });
  });

  describe('update', () => {
    it('should update an existing tecnica', async () => {
      const dto = { nombre: 'Armbar Mejorado' };
      const result = await controller.update(mockUser, '1', dto);
      expect(result.nombre).toBe('Armbar Mejorado');
    });

    it('should throw NotFoundException if id does not exist', async () => {
      await expect(controller.update(mockUser, '999', { nombre: 'No existe' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a tecnica', async () => {
      const result = await controller.remove(mockUser, '1');
      expect(result.mensaje).toContain('eliminada correctamente');
      
      // Verify it was actually removed
      await expect(controller.findOne(mockUser, '1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when deleting a non-existent id', async () => {
      await expect(controller.remove(mockUser, '999')).rejects.toThrow(NotFoundException);
    });
  });
});
