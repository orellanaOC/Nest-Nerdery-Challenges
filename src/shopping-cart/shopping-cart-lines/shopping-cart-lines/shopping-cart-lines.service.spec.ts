import {
	Test, TestingModule
} from '@nestjs/testing';
import {
	ShoppingCartLinesService
} from './shopping-cart-lines.service';
import {
	PrismaService
} from 'prisma/prisma/prisma.service';
import {
	ProductsService
} from 'src/products/products/products.service';

const mockPrismaService = {
	orderLine: {
		create: jest.fn(),
		findMany: jest.fn(),
	},
};

const mockProductsService = {
	findOne: jest.fn(),
};

describe('ShoppingCartLinesService', () => {
	let service: ShoppingCartLinesService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ShoppingCartLinesService,
				{
					provide: PrismaService, useValue: mockPrismaService
				},
				{
					provide: ProductsService, useValue: mockProductsService
				},
			],
		}).compile();

		service = module.get<ShoppingCartLinesService>(
			ShoppingCartLinesService
		);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
