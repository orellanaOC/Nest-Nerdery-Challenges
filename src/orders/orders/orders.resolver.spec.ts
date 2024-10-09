import { Test, TestingModule } from '@nestjs/testing';
import { OrdersResolver } from './orders.resolver';
import { OrdersService } from './orders.service';
import { PrismaService } from 'prisma/prisma/prisma.service';

const mockPrismaService = {};

const mockOrdersService = {
	findOneByPaymentIntentId: jest.fn(),
};

describe('OrdersResolver', () => {
	let resolver: OrdersResolver;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				OrdersResolver,
				{ provide: OrdersService, useValue: mockOrdersService },
				{ provide: PrismaService, useValue: mockPrismaService },
			],
		}).compile();

		resolver = module.get<OrdersResolver>(OrdersResolver);
	});

	it('should be defined', () => {
		expect(resolver).toBeDefined();
	});
});
