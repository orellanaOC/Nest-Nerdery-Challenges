import { Test, TestingModule } from '@nestjs/testing';
import { ShoppingCartsService } from './shopping-cart.service';
import { PrismaService } from 'prisma/prisma/prisma.service';
import { ShoppingCartLinesService } from '../shopping-cart-lines/shopping-cart-lines/shopping-cart-lines.service';

const mockPrismaService = {};

const mockShoppingCartLinesService = {};

describe('ShoppingCartsService', () => {
	let service: ShoppingCartsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ShoppingCartsService,
				{ provide: PrismaService, useValue: mockPrismaService },
				{
					provide: ShoppingCartLinesService,
					useValue: mockShoppingCartLinesService,
				},
			],
		}).compile();

		service = module.get<ShoppingCartsService>(ShoppingCartsService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
