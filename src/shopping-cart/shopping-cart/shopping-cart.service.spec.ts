import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma/prisma.service';
import { ShoppingCartLinesService } from '../shopping-cart-lines/shopping-cart-lines/shopping-cart-lines.service';
import { ShoppingCartLineInput } from '../shopping-cart-lines/dto/shopping-cart-line-input.dto';
import { ShoppingCartsService } from './shopping-cart.service';

const mockPrismaService = {
	shoppingCart: {
		findUnique: jest.fn(),
		update: jest.fn(),
	},
	shoppingCartLine: {
		deleteMany: jest.fn(),
	},
};

const mockShoppingCartLinesService = {
	getLinesByCartId: jest.fn(),
	updateShoppingCartLines: jest.fn(),
};

describe('ShoppingCartsService', () => {
	let service: ShoppingCartsService;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ShoppingCartsService,
				{ provide: PrismaService, useValue: mockPrismaService },
				{ provide: ShoppingCartLinesService, useValue: mockShoppingCartLinesService },
			],
		}).compile();

		service = module.get<ShoppingCartsService>(ShoppingCartsService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('getShoppingCartByUserId', () => {
		it('should return the shopping cart for the given user ID', async () => {
			const userId = 1;
			const mockCart = {
				userId,
				total: 100,
				lines: [],
			};
			const mockLines = [
				{
					id: 1,
					productQuantity: 2,
					shoppingCartId: userId,
					product: {
						id: 1,
						name: 'Product 1',
						price: 50,
					},
				},
			];

			mockPrismaService.shoppingCart.findUnique.mockResolvedValue(mockCart);
			mockShoppingCartLinesService.getLinesByCartId.mockResolvedValue(mockLines);

			const result = await service.getShoppingCartByUserId(userId);

			expect(mockPrismaService.shoppingCart.findUnique).toHaveBeenCalledWith({
				where: { userId },
				include: { lines: true },
			});
			expect(result).toEqual({
				userId,
				totalAmount: mockCart.total,
				lines: mockLines,
			});
		});

		it('should throw NotFoundException if the cart is not found', async () => {
			const userId = 1;

			mockPrismaService.shoppingCart.findUnique.mockResolvedValue(null);

			await expect(service.getShoppingCartByUserId(userId)).rejects.toThrow(NotFoundException);
		});
	});

	describe('updateShoppingCart', () => {
		it('should update the shopping cart and return the updated cart', async () => {
			const userId = 1;
			const shoppingCartLineInput: ShoppingCartLineInput = {
				product: {
					id: 1,
					name: 'Product 1',
					price: 50,
					stock: 10,
					category: { id: 1, name: 'Category 1' },
				},
				productQuantity: 2,
			};
			const mockCart = { userId, total: 100 };
			const mockUpdatedLines = [
				{
					id: 1,
					productQuantity: 2,
					shoppingCartId: userId,
					product: {
						id: 1,
						name: 'Product 1',
						price: 50,
					},
				},
			];

			mockPrismaService.shoppingCart.findUnique.mockResolvedValue(mockCart);
			mockShoppingCartLinesService.updateShoppingCartLines.mockResolvedValue(mockUpdatedLines);
			mockPrismaService.shoppingCart.update.mockResolvedValue({
				...mockCart,
				total: 100,
			});

			const result = await service.updateShoppingCart(userId, shoppingCartLineInput);

			expect(mockPrismaService.shoppingCart.findUnique).toHaveBeenCalledWith({
				where: { userId },
			});
			expect(mockShoppingCartLinesService.updateShoppingCartLines).toHaveBeenCalledWith(userId, shoppingCartLineInput);
			expect(mockPrismaService.shoppingCart.update).toHaveBeenCalledWith({
				where: { userId },
				data: { total: 100 },
			});
			expect(result).toEqual({
				userId,
				totalAmount: 100,
				lines: mockUpdatedLines,
			});
		});

		it('should throw NotFoundException if the cart is not found', async () => {
			const userId = 1;
			const shoppingCartLineInput: ShoppingCartLineInput = {
				product: {
					id: 1,
					name: 'Product 1',
					price: 50,
					stock: 10,
					category: { id: 1, name: 'Category 1' },
				},
				productQuantity: 2,
			};

			mockPrismaService.shoppingCart.findUnique.mockResolvedValue(null);

			await expect(service.updateShoppingCart(userId, shoppingCartLineInput)).rejects.toThrow(NotFoundException);
		});
	});

	describe('clearShoppingCart', () => {
		it('should clear the shopping cart for the given user ID', async () => {
			const userId = 1;

			await service.clearShoppingCart(userId);

			expect(mockPrismaService.shoppingCartLine.deleteMany).toHaveBeenCalledWith({
				where: { shoppingCartId: userId },
			});
		});
	});
});
