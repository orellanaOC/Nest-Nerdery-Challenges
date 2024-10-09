import { Test, TestingModule } from '@nestjs/testing';
import { OrderLinesService } from './order-lines.service';
import { PrismaService } from 'prisma/prisma/prisma.service';
import { ShoppingCartLine } from 'src/shopping-cart/shopping-cart-lines/entities/shopping-cart-line.entity';
import { ProductsService } from 'src/products/products/products.service';

const mockPrismaService = {
	orderLine: {
		create: jest.fn(),
		findMany: jest.fn(),
	},
};

const mockProductsService = {
	findOne: jest.fn(),
};

describe('OrderLinesService', () => {
	let service: OrderLinesService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				OrderLinesService,
				{ provide: PrismaService, useValue: mockPrismaService },
				{ provide: ProductsService, useValue: mockProductsService },
			],
		}).compile();

		service = module.get<OrderLinesService>(OrderLinesService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('createOrderLineFromCartLine', () => {
		it('should create an order line from a shopping cart line', async () => {
			const orderId = 1;

			const shoppingCartLine: ShoppingCartLine = {
				id: 1,
				shoppingCartId: 2,
				productQuantity: 2,
				product: {
					id: 1,
					price: 1000,
					name: 'name',
					stock: 10,
					specification: 'specification',
					enable: true,
					category: {
						id: 2,
						name: 'mock category',
					},
					picture: [
						{
							id: 2,
							imageUrl: 'mock_picture_url',
							productId: 1,
							createdAt: new Date(),
						},
					],
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockPrismaService.orderLine.create.mockResolvedValue({
				id: 1,
				orderId,
				productId: shoppingCartLine.product.id,
				productQuantity: shoppingCartLine.productQuantity,
				pricePerItem: shoppingCartLine.product.price,
				subTotal:
					shoppingCartLine.product.price *
					shoppingCartLine.productQuantity,
			});

			const result = await service.createOrderLineFromCartLine(
				orderId,
				shoppingCartLine
			);

			expect(result).toEqual({
				id: 1,
				orderId,
				productId: shoppingCartLine.product.id,
				productQuantity: shoppingCartLine.productQuantity,
				pricePerItem: shoppingCartLine.product.price,
				subTotal:
					shoppingCartLine.product.price *
					shoppingCartLine.productQuantity,
			});

			expect(mockPrismaService.orderLine.create).toHaveBeenCalledWith({
				data: {
					orderId,
					productId: shoppingCartLine.product.id,
					productQuantity: shoppingCartLine.productQuantity,
					pricePerItem: shoppingCartLine.product.price,
					subTotal:
						shoppingCartLine.product.price *
						shoppingCartLine.productQuantity,
				},
			});
		});
	});

	describe('getLinesByOrderId', () => {
		it('should return lines for a given order ID', async () => {
			const orderId = 1;

			const orderLines = [
				{
					id: 1,
					orderId,
					productQuantity: 2,
					pricePerItem: 1000,
					subTotal: 2000,
					createdAt: new Date(),
					product: {
						id: 1,
						price: 1000,
						name: 'Product 1',
						stock: 10,
						specification: 'specification',
						enable: true,
						category: {
							id: 2,
							name: 'mock category',
						},
						picture: [
							{
								id: 1,
								imageUrl: 'mock_picture_url',
								productId: 1,
								createdAt: new Date(),
								updatedAt: new Date(),
							},
						],
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				},
				{
					id: 2,
					orderId,
					productQuantity: 3,
					pricePerItem: 2000,
					subTotal: 6000,
					createdAt: new Date(),
					product: {
						id: 2,
						price: 2000,
						name: 'Product 2',
						stock: 5,
						specification: 'specification',
						enable: true,
						category: {
							id: 3,
							name: 'mock category 2',
						},
						picture: [],
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				},
			];

			mockPrismaService.orderLine.findMany.mockResolvedValue(orderLines);

			const mockProduct1 = {
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
			};

			const mockProduct2 = {
				id: 2,
				price: 2000,
				name: 'Product 2',
				stock: 5,
				specification: 'Some specification',
				enable: true,
				category: { id: 3, name: 'mock category 2' },
				picture: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockProductsService.findOne
				.mockResolvedValueOnce(mockProduct1)
				.mockResolvedValueOnce(mockProduct2);

			const result = await service.getLinesByOrderId(orderId);

			expect(result).toEqual([
				{
					id: 1,
					productQuantity: 2,
					orderId: 1,
					pricePerItem: 1000,
					subTotal: 2000,
					createdAt: expect.any(Date),
					product: mockProduct1,
				},
				{
					id: 2,
					productQuantity: 3,
					orderId: 1,
					pricePerItem: 2000,
					subTotal: 6000,
					createdAt: expect.any(Date),
					product: mockProduct2,
				},
			]);

			expect(mockPrismaService.orderLine.findMany).toHaveBeenCalledWith({
				where: { orderId },
				include: {
					product: {
						include: {
							category: true,
							picture: true,
						},
					},
				},
			});

			expect(mockProductsService.findOne).toHaveBeenCalledTimes(
				orderLines.length
			);
		});
	});
});
