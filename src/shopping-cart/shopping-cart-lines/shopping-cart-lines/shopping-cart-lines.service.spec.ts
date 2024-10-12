import { Test, TestingModule } from '@nestjs/testing';
import { ShoppingCartLinesService } from './shopping-cart-lines.service';
import { ProductsService } from 'src/products/products/products.service';
import { ShoppingCartLineInput } from '../dto/shopping-cart-line-input.dto';
import { PrismaService } from 'prisma/prisma/prisma.service';

const mockPrismaService = {
	shoppingCartLine: {
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	},
};

const mockProductsService = {
	findOne: jest.fn(),
};

describe('ShoppingCartLinesService', () => {
	let service: ShoppingCartLinesService;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ShoppingCartLinesService,
				{ provide: PrismaService, useValue: mockPrismaService },
				{ provide: ProductsService, useValue: mockProductsService },
			],
		}).compile();

		service = module.get<ShoppingCartLinesService>(ShoppingCartLinesService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('updateShoppingCartLines', () => {
		it('should add a new shopping cart line if it does not exist', async () => {
			const userId = 1;
			const shoppingCartLineInput: ShoppingCartLineInput = {
				product: {
					id: 2,
					name: 'Product 2',
					price: 200,
					stock: 10,
					category: {
						id: 1,
						name: 'category 1',
					},
				},
				productQuantity: 3,
			};

			mockPrismaService.shoppingCartLine.findMany.mockResolvedValueOnce([]);

			mockProductsService.findOne.mockResolvedValue({
				id: 2,
				name: 'Product 2',
				price: 200,
			});

			mockPrismaService.shoppingCartLine.create.mockResolvedValue({
				id: 1,
				productQuantity: 3,
				shoppingCartId: userId,
				productId: shoppingCartLineInput.product.id,
			});

			mockPrismaService.shoppingCartLine.findMany.mockResolvedValueOnce([{
				id: 1,
				productQuantity: 3,
				shoppingCartId: userId,
				product: {
					id: 2,
					name: 'Product 2',
					price: 200,
				},
			}]);

			const result = await service.updateShoppingCartLines(userId, shoppingCartLineInput);

			expect(mockPrismaService.shoppingCartLine.create).toHaveBeenCalledWith({
				data: {
					productQuantity: 3,
					shoppingCartId: userId,
					productId: shoppingCartLineInput.product.id,
				},
			});

			expect(result).toEqual([{
				id: 1,
				productQuantity: 3,
				shoppingCartId: userId,
				product: {
					id: 2,
					name: 'Product 2',
					price: 200,
				},
			}]);
		});
	});

	describe('getLinesByCartId', () => {
		it('should return shopping cart lines with product details', async () => {
			const shoppingCartId = 1;
			const mockLines = [
				{
					id: 1,
					productQuantity: 3,
					shoppingCartId: shoppingCartId,
					createdAt: new Date(),
					updatedAt: new Date(),
					product: {
						id: 2,
						name: 'Product 2',
						price: 200,
						category: { id: 1, name: 'Category 1' },
						picture: { id: 1, url: 'http://example.com/picture.jpg' },
					},
				},
			];

			const mockProduct = {
				id: 2,
				name: 'Product 2',
				price: 200,
				category: { id: 1, name: 'Category 1' },
				picture: { id: 1, url: 'http://example.com/picture.jpg' },
			};

			mockPrismaService.shoppingCartLine.findMany.mockResolvedValue(mockLines);
			mockProductsService.findOne.mockResolvedValue(mockProduct);

			const result = await service.getLinesByCartId(shoppingCartId);

			expect(mockPrismaService.shoppingCartLine.findMany).toHaveBeenCalledWith({
				where: { shoppingCartId },
				include: {
					product: {
						include: {
							category: true,
							picture: true,
						},
					},
				},
			});

			expect(result).toEqual([
				{
					id: 1,
					productQuantity: 3,
					shoppingCartId: shoppingCartId,
					createdAt: mockLines[0].createdAt,
					updatedAt: mockLines[0].updatedAt,
					product: mockProduct,
				},
			]);
		});
	});
});
