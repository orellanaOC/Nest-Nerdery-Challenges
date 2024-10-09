import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from 'prisma/prisma/prisma.service';
import { OrderLinesService } from '../order-lines/order-lines/order-lines.service';
import { ShoppingCartsService } from 'src/shopping-cart/shopping-cart/shopping-cart.service';
import { PaginationService } from 'src/pagination/pagination/pagination.service';
import { PaymentsService } from 'src/payments/payments.service';
import { OrderLine } from '../order-lines/entities/order-line.entity';

const mockPrismaService = {
	order: {
		create: jest.fn(),
		findUnique: jest.fn(),
		findMany: jest.fn(),
	},
};

const mockOrderLinesService = {
	createOrderLineFromCartLine: jest.fn(),
	getLinesByOrderId: jest.fn(),
};

const mockShoppingCartsService = {
	getShoppingCartByUserId: jest.fn(),
	clearShoppingCart: jest.fn(),
};

const mockPaginationService = {
	paginate: jest.fn(),
};

const mockPaymentsService = {
	createPaymentIntent: jest.fn(),
};

describe('OrdersService', () => {
	let service: OrdersService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				OrdersService,
				{ provide: PrismaService, useValue: mockPrismaService },
				{ provide: OrderLinesService, useValue: mockOrderLinesService },
				{
					provide: ShoppingCartsService,
					useValue: mockShoppingCartsService,
				},
				{ provide: PaginationService, useValue: mockPaginationService },
				{ provide: PaymentsService, useValue: mockPaymentsService },
			],
		}).compile();

		service = module.get<OrdersService>(OrdersService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('createOrderFromCart', () => {
		it('should create an order from the shopping cart', async () => {
			const userId = 1;
			const shoppingCart = {
				lines: [
					{ product: { price: 100 }, productQuantity: 2 },
					{ product: { price: 200 }, productQuantity: 1 },
				],
			};

			const totalAmount = 400; // (100 * 2) + (200 * 1)
			const paymentIntent = { id: 'payment_intent_id' };

			mockShoppingCartsService.getShoppingCartByUserId.mockResolvedValue(
				shoppingCart
			);
			mockPaymentsService.createPaymentIntent.mockResolvedValue(
				paymentIntent
			);
			mockPrismaService.order.create.mockResolvedValue({
				id: 1,
				userId,
				total: totalAmount,
				paymentIntentId: paymentIntent.id,
			});

			mockPrismaService.order.findUnique.mockResolvedValue({
				id: 1,
				userId,
				total: totalAmount,
				paymentIntentId: paymentIntent.id,
				lines: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			const result = await service.createOrderFromCart(userId);

			expect(result).toEqual({
				id: 1,
				userId,
				total: totalAmount,
				paymentIntentId: paymentIntent.id,
				lines: [],
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
			});

			expect(
				mockShoppingCartsService.getShoppingCartByUserId
			).toHaveBeenCalledWith(userId);
			expect(
				mockPaymentsService.createPaymentIntent
			).toHaveBeenCalledWith(totalAmount, 'usd');
		});

		it('should throw an error if the shopping cart is empty', async () => {
			const userId = 1;
			mockShoppingCartsService.getShoppingCartByUserId.mockResolvedValue({
				lines: [],
			});

			await expect(service.createOrderFromCart(userId)).rejects.toThrow(
				'Shopping cart is empty'
			);
		});
	});

	describe('findOneByPaymentIntentId', () => {
		it('should return an order by payment intent ID', async () => {
			const paymentIntentId = 'payment_intent_id';

			const order = {
				id: 1,
				userId: 1,
				status: 'SUCCEEDED',
				total: 400,
				paymentIntentId: paymentIntentId,
				createdAt: new Date(),
				updatedAt: new Date(),
				lines: [],
			};

			mockPrismaService.order.findUnique.mockResolvedValue(order);

			const mockLines: OrderLine[] = [
				{
					id: 1,
					orderId: 1,
					productQuantity: 2,
					pricePerItem: 1000,
					subTotal: 2000,
					createdAt: new Date(),
					product: {
						id: 1,
						price: 1000,
						name: 'Product 1',
						stock: 10,
						specification: 'Some specification',
						enable: true,
						category: { id: 2, name: 'mock category' },
						picture: [],
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				},
			];

			jest.spyOn(
				service['orderLineService'],
				'getLinesByOrderId'
			).mockResolvedValue(mockLines);

			const result =
				await service.findOneByPaymentIntentId(paymentIntentId);

			expect(result).toEqual({
				id: 1,
				userId: 1,
				status: 'SUCCEEDED',
				total: 400,
				paymentIntentId: paymentIntentId,
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
				lines: mockLines,
			});

			expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
				where: { paymentIntentId },
				include: { lines: true },
			});
		});
	});
});
