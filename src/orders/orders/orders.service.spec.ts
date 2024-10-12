import {
	Test, TestingModule
} from '@nestjs/testing';
import {
	OrdersService
} from './orders.service';
import {
	PrismaService
} from 'prisma/prisma/prisma.service';
import {
	OrderLinesService
} from '../order-lines/order-lines/order-lines.service';
import {
	ShoppingCartsService
} from 'src/shopping-cart/shopping-cart/shopping-cart.service';
import {
	PaginationService
} from 'src/pagination/pagination/pagination.service';
import {
	PaymentsService
} from 'src/payments/payments.service';
import {
	OrderLine
} from '../order-lines/entities/order-line.entity';
import { OrderStatus } from '@prisma/client';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

const mockPrismaService = {
	order: {
		create: jest.fn(),
		update: jest.fn(),
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
		jest.clearAllMocks();
	
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				OrdersService,
				{
					provide: PrismaService, useValue: mockPrismaService
				},
				{
					provide: OrderLinesService, useValue: mockOrderLinesService
				},
				{
					provide: ShoppingCartsService,
					useValue: mockShoppingCartsService,
				},
				{
					provide: PaginationService, useValue: mockPaginationService
				},
				{
					provide: PaymentsService, useValue: mockPaymentsService
				},
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
					{
						product: {
							price: 100
						}, productQuantity: 2
					},
					{
						product: {
							price: 200
						}, productQuantity: 1
					},
				],
			};

			const totalAmount = 400; // (100 * 2) + (200 * 1)
			const paymentIntent = {
				id: 'payment_intent_id'
			};

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

	describe('orderStatusChange', () => {
		it('should update order status to SUCCEEDED and clear shopping cart if successful', async () => {
			const paymentIntentId = 'test-payment-intent-id';
			const order = {
				id: 1,
				userId: 123,
				status: OrderStatus.PENDING,
				total: 400,
				paymentIntentId: paymentIntentId,
				createdAt: new Date(),
				updatedAt: new Date(),
				lines: [],
			};

			jest.spyOn(service, 'findOneByPaymentIntentId').mockResolvedValue(order);

			mockPrismaService.order.update.mockResolvedValue({
				...order,
				status: OrderStatus.SUCCEEDED,
			});

			const result = await service.orderStatusChange(paymentIntentId, true);

			expect(service.findOneByPaymentIntentId).toHaveBeenCalledWith(paymentIntentId);

			expect(mockShoppingCartsService.clearShoppingCart).toHaveBeenCalledWith(order.userId);

			expect(result).toEqual({
				...order,
				status: OrderStatus.SUCCEEDED,
			});
		});

		it('should update order status to FAILED if unsuccessful', async () => {
			const paymentIntentId = 'test-payment-intent-id';
			const order = {
				id: 1,
				userId: 123,
				status: OrderStatus.PENDING,
				total: 400,
				paymentIntentId: paymentIntentId,
				createdAt: new Date(),
				updatedAt: new Date(),
				lines: [],
			};

			jest.spyOn(service, 'findOneByPaymentIntentId').mockResolvedValue(order);

			mockPrismaService.order.update.mockResolvedValue({
				...order,
				status: OrderStatus.FAILED,
			});

			const result = await service.orderStatusChange(paymentIntentId, false);

			expect(service.findOneByPaymentIntentId).toHaveBeenCalledWith(paymentIntentId);

			expect(mockShoppingCartsService.clearShoppingCart).not.toHaveBeenCalled();

			expect(result).toEqual({
				...order,
				status: OrderStatus.FAILED,
			});
		});

		it('should throw NotFoundException if order is not found', async () => {
			const paymentIntentId = 'test-payment-intent-id';

			jest.spyOn(service, 'findOneByPaymentIntentId').mockResolvedValue(null);

			await expect(service.orderStatusChange(paymentIntentId, true)).rejects.toThrow(NotFoundException);
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
						category: {
							id: 2, name: 'mock category'
						},
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
				where: {
					paymentIntentId
				},
				include: {
					lines: true
				},
			});
		});
	});

	describe('findOrderById', () => {
		it('should return an order by ID for authorized user', async () => {
			const orderId = 1;
			const userId = 123;
			const roleId = 1;
			const mockOrder = {
				id: orderId,
				userId,
				status: 'PENDING',
				total: 400,
				createdAt: new Date(),
				updatedAt: new Date(),
				lines: [],
			};
	
			mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
			mockOrderLinesService.getLinesByOrderId.mockResolvedValue([]);
	
			const result = await service.findOrderById(orderId, userId, roleId);
	
			expect(result).toEqual({
				id: orderId,
				userId: mockOrder.userId,
				status: mockOrder.status,
				total: mockOrder.total,
				createdAt: mockOrder.createdAt,
				updatedAt: mockOrder.updatedAt,
				lines: [],
			});
	
			expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
				where: { id: orderId },
				include: { lines: true },
			});
		});
	
		it('should throw NotFoundException if the order does not exist', async () => {
			const orderId = 1;
			const userId = 123;
			const roleId = 1;
	
			mockPrismaService.order.findUnique.mockResolvedValue(null);
	
			await expect(service.findOrderById(orderId, userId, roleId)).rejects.toThrow(NotFoundException);
	
			expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
				where: { id: orderId },
				include: { lines: true },
			});
		});
	
		it('should throw UnauthorizedException if the user is not the owner and not an admin', async () => {
			const orderId = 1;
			const userId = 123;
			const roleId = 1;
			const mockOrder = {
				id: orderId,
				userId: 456,
				status: 'PENDING',
				total: 400,
				createdAt: new Date(),
				updatedAt: new Date(),
				lines: [],
			};
	
			mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
	
			await expect(service.findOrderById(orderId, userId, roleId)).rejects.toThrow(UnauthorizedException);
	
			expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
				where: { id: orderId },
				include: { lines: true },
			});
		});
	});
	
	describe('orders', () => {
		it('should return a paginated list of orders for a user', async () => {
			const userId = 123;
			const filter = { status: OrderStatus.SUCCEEDED, pagination: { first: 10 }, userId };
	
			const mockOrders = [
				{
					id: 1,
					userId,
					status: OrderStatus.SUCCEEDED,
					total: 400,
					createdAt: new Date(),
					updatedAt: new Date(),
					lines: [],
				},
			];
	
			mockPrismaService.order.findMany.mockResolvedValue(mockOrders);
			mockPaginationService.paginate.mockResolvedValue({ edges: mockOrders, pageInfo: {} });

			const result = await service.orders(filter, userId);

			expect(result).toEqual({
				edges: mockOrders,
				pageInfo: expect.any(Object),
			});

			expect(mockPaginationService.paginate).toHaveBeenCalledWith(
				expect.any(Function),
				filter.pagination,
				'id',
				{
					userId: filter.userId,
					status: filter.status,
				},
				{ createdAt: 'asc' },
				{
					lines: {
						include: {
							product: {
								include: {
									picture: true,
									category: true,
								},
							},
						},
					},
				}
			);
		});
	
		it('should return orders for the logged in user if userIdLogged is provided', async () => {
			const userIdLogged = 123;
			const filter = { status: OrderStatus.SUCCEEDED, pagination: { first: 10 } };
	
			const mockOrders = [
				{
					id: 1,
					userId: userIdLogged,
					status: OrderStatus.SUCCEEDED,
					total: 400,
					createdAt: new Date(),
					updatedAt: new Date(),
					lines: [],
				},
			];
	
			mockPrismaService.order.findMany.mockResolvedValue(mockOrders);
			mockPaginationService.paginate.mockResolvedValue({ edges: mockOrders, pageInfo: {} });
	
			const result = await service.orders(filter, userIdLogged);
	
			expect(result).toEqual({
				edges: mockOrders,
				pageInfo: expect.any(Object),
			});
	
			expect(mockPaginationService.paginate).toHaveBeenCalledWith(
				expect.any(Function),
				filter.pagination,
				'id',
				{
					userId: userIdLogged,
					status: filter.status,
				},
				{ createdAt: 'asc' },
				{
					lines: {
						include: {
							product: {
								include: {
									picture: true,
									category: true,
								},
							},
						},
					},
				}
			);
		});
	});	
});
