import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { OrdersService } from 'src/orders/orders/orders.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';

const mockConfigService = {
	get: jest.fn((key: string) => {
		if (key === 'STRIPE_SECRET_KEY') {
			return 'fake_stripe_key';
		}
		if (key === 'STRIPE_WEBHOOK_SECRET') {
			return 'fake_webhook_secret';
		}
	}),
};

const mockOrdersService = {
	orderStatusChange: jest.fn(),
};

describe('PaymentsService', () => {
	let service: PaymentsService;
	let stripeMock: jest.Mocked<Stripe>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PaymentsService,
				{
					provide: ConfigService,
					useValue: mockConfigService,
				},
				{
					provide: OrdersService,
					useValue: mockOrdersService,
				},
			],
		}).compile();

		service = module.get<PaymentsService>(PaymentsService);

		// Mocking Stripe instance
		stripeMock = {
			paymentIntents: {
				create: jest.fn(),
				confirm: jest.fn(),
			},
			webhooks: {
				constructEvent: jest.fn(),
			},
		} as any;
		(service as any).stripe = stripeMock;
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('constructEvent', () => {
		it('should construct a webhook event', () => {
			const payload = {};
			const signature = 'test_signature';
			const mockEvent = { id: 'evt_test' };

			(stripeMock.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent);
			mockConfigService.get.mockReturnValue('fake_webhook_secret');

			const event = service.constructEvent(payload, signature);

			expect(event).toEqual(mockEvent);
			expect(stripeMock.webhooks.constructEvent).toHaveBeenCalledWith(
				payload,
				signature,
				'fake_webhook_secret',
			);
		});

		it('should throw a BadRequestException if event construction fails', () => {
			const payload = {};
			const signature = 'test_signature';

			(stripeMock.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
				throw new Error('Invalid signature');
			});

			expect(() => service.constructEvent(payload, signature)).toThrow(
				BadRequestException,
			);
		});
	});

	describe('createPaymentIntent', () => {
		it('should create a payment intent', async () => {
			const mockPaymentIntent = { id: 'pi_test' };
			(stripeMock.paymentIntents.create as jest.Mock).mockResolvedValue(mockPaymentIntent);

			const result = await service.createPaymentIntent(1000, 'usd');

			expect(result).toEqual(mockPaymentIntent);
			expect(stripeMock.paymentIntents.create).toHaveBeenCalledWith({
				amount: 1000,
				currency: 'usd',
				payment_method: expect.any(String),
				automatic_payment_methods: {
					enabled: true,
					allow_redirects: 'never',
				},
			});
		});
	});

	describe('confirmPaymentIntent', () => {
		it('should confirm a payment intent', async () => {
			const mockPaymentIntent = { id: 'pi_test' };
			(stripeMock.paymentIntents.confirm as jest.Mock).mockResolvedValue(mockPaymentIntent);

			const result = await service.confirmPaymentIntent('pi_test');

			expect(result).toEqual(mockPaymentIntent);
			expect(stripeMock.paymentIntents.confirm).toHaveBeenCalledWith('pi_test');
		});

		it('should throw a BadRequestException if confirmation fails', async () => {
			(stripeMock.paymentIntents.confirm as jest.Mock).mockRejectedValue(
				new Error('Confirmation failed'),
			);

			await expect(
				service.confirmPaymentIntent('pi_test'),
			).rejects.toThrow(BadRequestException);
		});
	});

	describe('orderStatusChange', () => {
		it('should call orderStatusChange in OrdersService', async () => {
			await service.orderStatusChange('pi_test', true);

			expect(mockOrdersService.orderStatusChange).toHaveBeenCalledWith(
				'pi_test',
				true,
			);
		});
	});

	describe('handleWebhookEvent', () => {
		it('should handle payment_intent.succeeded event', async () => {
			const event = {
				type: 'payment_intent.succeeded',
				data: { object: { id: 'pi_test' } },
			};

			await service.handleWebhookEvent(event as Stripe.Event);

			expect(mockOrdersService.orderStatusChange).toHaveBeenCalledWith(
				'pi_test',
				true,
			);
		});

		it('should handle payment_intent.payment_failed event', async () => {
			const event = {
				type: 'payment_intent.payment_failed',
				data: { object: { id: 'pi_test' } },
			};

			await service.handleWebhookEvent(event as Stripe.Event);

			expect(mockOrdersService.orderStatusChange).toHaveBeenCalledWith(
				'pi_test',
				false,
			);
		});

		it('should handle payment_intent.created event and confirm the payment intent', async () => {
			const event = {
				type: 'payment_intent.created',
				data: { object: { id: 'pi_test' } },
			};

			(stripeMock.paymentIntents.confirm as jest.Mock).mockResolvedValue({ id: 'pi_test' });

			await service.handleWebhookEvent(event as Stripe.Event);

			expect(stripeMock.paymentIntents.confirm).toHaveBeenCalledWith('pi_test');
		});

		it('should log unhandled event types', async () => {
			const event = {
				type: 'unknown_event',
				data: { object: { id: 'pi_test' } },
			};

			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			await service.handleWebhookEvent(event as Stripe.Event);

			expect(consoleSpy).toHaveBeenCalledWith('Unhandled event type unknown_event.');
		});
	});
});
