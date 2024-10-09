import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from 'prisma/prisma/prisma.service';
import { CategoriesService } from '../categories/categories.service';
import { PaginationService } from 'src/pagination/pagination/pagination.service';

const mockPrismaService = {
	product: {
		findMany: jest.fn(),
		create: jest.fn(),
		findUnique: jest.fn(),
	},
};

const mockCategoriesService = {
	findOne: jest.fn(),
};

const mockPaginationService = {
	paginate: jest.fn(),
};

describe('ProductsService', () => {
	let service: ProductsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ProductsService,
				{ provide: PrismaService, useValue: mockPrismaService },
				{ provide: CategoriesService, useValue: mockCategoriesService },
				{ provide: PaginationService, useValue: mockPaginationService },
			],
		}).compile();

		service = module.get<ProductsService>(ProductsService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
