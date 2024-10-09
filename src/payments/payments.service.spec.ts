import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from 'src/orders/orders/orders.service';
import Stripe from 'stripe';

const mockConfigService = {
	get: jest.fn((key: string) => {
		if (key === 'STRIPE_SECRET_KEY') {
			return 'mock_stripe_secret_key';
		}
		return null;
	}),
};

const mockOrdersService = {};

describe('PaymentsService', () => {
	let service: PaymentsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PaymentsService,
				{ provide: ConfigService, useValue: mockConfigService },
				{ provide: OrdersService, useValue: mockOrdersService },
			],
		}).compile();

		service = module.get<PaymentsService>(PaymentsService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
