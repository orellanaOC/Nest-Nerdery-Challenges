import {
	Test, TestingModule
} from '@nestjs/testing';
import {
	ShoppingCartsService
} from './shopping-cart.service';
import {
	ShoppingCartResolver
} from './shopping-cart.resolver';

const mockShoppingCartsService = {};

describe('ShoppingCartsResolver', () => {
	let resolver: ShoppingCartResolver;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ShoppingCartResolver,
				{
					provide: ShoppingCartsService,
					useValue: mockShoppingCartsService,
				},
			],
		}).compile();

		resolver = module.get<ShoppingCartResolver>(ShoppingCartResolver);
	});

	it('should be defined', () => {
		expect(resolver).toBeDefined();
	});
});
