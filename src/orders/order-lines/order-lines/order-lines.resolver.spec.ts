import { Test, TestingModule } from '@nestjs/testing';
import { OrderLinesResolver } from './order-lines.resolver';

describe('OrderLinesResolver', () => {
	let resolver: OrderLinesResolver;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [OrderLinesResolver],
		}).compile();

		resolver = module.get<OrderLinesResolver>(OrderLinesResolver);
	});

	it('should be defined', () => {
		expect(resolver).toBeDefined();
	});
});
