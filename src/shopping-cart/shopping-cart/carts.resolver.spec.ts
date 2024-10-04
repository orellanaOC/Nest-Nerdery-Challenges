import { Test, TestingModule } from '@nestjs/testing';
import { ShoppingCartResolver } from './shopping-cart.resolver';

describe('CartsResolver', () => {
	let resolver: ShoppingCartResolver;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ShoppingCartResolver],
		}).compile();

		resolver = module.get<ShoppingCartResolver>(ShoppingCartResolver);
	});

	it('should be defined', () => {
		expect(resolver).toBeDefined();
	});
});
