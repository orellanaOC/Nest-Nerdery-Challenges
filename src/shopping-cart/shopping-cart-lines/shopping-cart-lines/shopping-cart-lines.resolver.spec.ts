import { Test, TestingModule } from '@nestjs/testing';
import { ShoppingCartLinesResolver } from './shopping-cart-lines.resolver';

describe('ShoppingCartLinesResolver', () => {
	let resolver: ShoppingCartLinesResolver;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ShoppingCartLinesResolver],
		}).compile();

		resolver = module.get<ShoppingCartLinesResolver>(
			ShoppingCartLinesResolver
		);
	});

	it('should be defined', () => {
		expect(resolver).toBeDefined();
	});
});
