import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../../../prisma/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
	let service: CategoriesService;
	const mockPrismaService = {
		category: {
			findUnique: jest.fn(),
		},
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CategoriesService,
				{ provide: PrismaService, useValue: mockPrismaService },
			],
		}).compile();

		service = module.get<CategoriesService>(CategoriesService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('findOne', () => {
		it('should return a category when it exists', async () => {
			const category = { id: 1, name: 'Test Category' };
			mockPrismaService.category.findUnique.mockResolvedValue(category);

			const result = await service.findOne(1);
			expect(result).toEqual(category);
		});

		it('should throw NotFoundException when category does not exist', async () => {
			mockPrismaService.category.findUnique.mockResolvedValue(null);

			await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
		});
	});
});
