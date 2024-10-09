import { Test, TestingModule } from '@nestjs/testing';
import { ProductsResolver } from './products.resolver';
import { ProductsService } from './products.service';
import { CategoriesService } from '../categories/categories.service';
import { PaginationService } from 'src/pagination/pagination/pagination.service';
import { PrismaService } from 'prisma/prisma/prisma.service';

const mockProductsService = {
	getAllProducts: jest.fn(),
	getProductById: jest.fn(),
	create: jest.fn(),
	update: jest.fn(),
	toggleProductEnableStatus: jest.fn(),
	toggleLikeProduct: jest.fn(),
};

const mockCategoriesService = {
	findOne: jest.fn(),
};

const mockPaginationService = {
	paginate: jest.fn(),
};

describe('ProductsResolver', () => {
	let resolver: ProductsResolver;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ProductsResolver,
				{ provide: ProductsService, useValue: mockProductsService },
				{ provide: CategoriesService, useValue: mockCategoriesService },
				{ provide: PaginationService, useValue: mockPaginationService },
				PrismaService,
			],
		}).compile();

		resolver = module.get<ProductsResolver>(ProductsResolver);
	});

	it('should be defined', () => {
		expect(resolver).toBeDefined();
	});
});
