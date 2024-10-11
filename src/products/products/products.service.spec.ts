import {
	Test, TestingModule
} from '@nestjs/testing';
import {
	ProductsService
} from './products.service';
import {
	PrismaService
} from 'prisma/prisma/prisma.service';
import {
	CategoriesService
} from '../categories/categories.service';
import {
	PaginationService
} from 'src/pagination/pagination/pagination.service';
import { Product } from './entities/product.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductConnection } from './dto/product-connection.entity';
import { CategoryFilter } from '../categories/dto/category-filter.dto';
import { PaginationInput } from 'src/pagination/dto/pagination-input.dto';
import { ProductEdge } from './entities/product-edge.entity';

const mockPrismaService = {
	product: {
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		findUnique: jest.fn(),
	},
	likeProduct: {
		findUnique: jest.fn(),
		delete: jest.fn(),
		create: jest.fn(),
	},
};

const mockCategoriesService = {
	findOne: jest.fn(),
};

const mockPaginationService = {
	paginate: jest.fn(),
};

describe('ProductsService', () => {
	let service: ProductsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ProductsService,
				{
					provide: PrismaService, useValue: mockPrismaService
				},
				{
					provide: CategoriesService, useValue: mockCategoriesService
				},
				{
					provide: PaginationService, useValue: mockPaginationService
				},
			],
		}).compile();

		service = module.get<ProductsService>(ProductsService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('findAll', () => {
		it('should return an array of products', async () => {
			const result: Product[] = [
				{
					id: 1,
					name: 'Product 1',
					specification: 'Description 1',
					price: 100,
					picture: [],
					category: {
						id: 1,
						name: 'category 1'
					},
					stock: 10, 
					enable: true, 
					createdAt: new Date(), 
					updatedAt: new Date
				},
				{
					id: 2,
					name: 'Product 2',
					specification: 'Description 2',
					price: 200,
					stock: 10, 
					enable: true, 
					createdAt: new Date(), 
					updatedAt: new Date,
					picture: [],
					category: {
						id: 1,
						name: 'category 1'
					},
				},
			];

			mockPrismaService.product.findMany.mockResolvedValue(result);

			const products = await service.findAll();

			expect(products).toEqual(result);
			expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
				include: {
					picture: true,
					category: true,
				},
			});
		});
	});

	describe('findOne', () => {
		it('should return a product by ID', async () => {
			const productId = 1;
			const result: Product = {
				id: productId,
				name: 'Product 1',
				specification: 'Description 1',
				price: 100,
				picture: [],
				category: {
					id: 1,
					name: 'category 1'
				},
				stock: 10, 
				enable: true, 
				createdAt: new Date(), 
				updatedAt: new Date
			};

			mockPrismaService.product.findUnique.mockResolvedValue(result);

			const product = await service.findOne(productId);

			expect(product).toEqual(result);
			expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
				where: { id: productId },
				include: {
					picture: true,
					category: true,
				},
			});
		});

		it('should throw a NotFoundException if the product does not exist', async () => {
			const productId = 1;

			mockPrismaService.product.findUnique.mockResolvedValue(null);

			await expect(service.findOne(productId)).rejects.toThrow(NotFoundException);
			await expect(service.findOne(productId)).rejects.toThrow(`Product with ID ${productId} not found`);
		});
	});

	describe('create', () => {
		it('should create a product and return it', async () => {
			const createProductDto: CreateProductDto = {
				name: 'Product 1',
				specification: 'Description 1',
				price: 100,
				category: {
					id: 1,
					name: 'category 1'
				},
				stock: 10, 
			};

			const mockCategory = { id: 1, name: 'Category 1' };

			mockCategoriesService.findOne.mockResolvedValue(mockCategory);

			const result: Product = {
				id: 1,
				...createProductDto,
				enable: true, 
				createdAt: new Date(), 
				updatedAt: new Date,
				picture: [],
				category: mockCategory,
			};

			mockPrismaService.product.create.mockResolvedValue(result);

			const response = await service.create(createProductDto);

			expect(response).toEqual(result);
			expect(mockPrismaService.product.create).toHaveBeenCalledWith({
				data: {
					...createProductDto,
					category: {
						connect: {
							id: mockCategory.id,
						},
					},
				},
				include: {
					picture: true,
					category: true,
				},
			});
		});

		it('should throw NotFoundException if category does not exist', async () => {
			const createProductDto: CreateProductDto = {
				name: 'Product 1',
				stock: 10,
				price: 100,
				specification: 'Some specifications',
				category: { id: 1, name: 'category 1' },
			};

			mockCategoriesService.findOne.mockResolvedValue(null);

			await expect(service.create(createProductDto)).rejects.toThrow(
				NotFoundException,
			);
			await expect(service.create(createProductDto)).rejects.toThrow(
				`Category with ID ${createProductDto.category.id} not found`,
			);
		});
	});

	describe('update', () => {
		it('should update a product and return it', async () => {
			const mockCategory = { id: 2, name: 'Category 2' };
			const productId = 1;
			const updateProductDto: UpdateProductDto = {
				name: 'Updated Product',
				stock: 20,
				price: 150,
				specification: 'Updated specifications',
				enable: false,
				category: mockCategory,
			};

			const mockExistingProduct = {
				id: productId,
				name: 'Old Product',
				stock: 10,
				price: 100,
				specification: 'Old specifications',
				enable: true,
				picture: [],
				category: { id: 1, name: 'Category 1' },
			};

			mockPrismaService.product.findUnique.mockResolvedValue(mockExistingProduct);
			mockCategoriesService.findOne.mockResolvedValue(mockCategory);

			const updatedResult: Product = {
				...mockExistingProduct,
				...updateProductDto,
				category: mockCategory,
				createdAt: new Date, 
				updatedAt: new Date
			};

			mockPrismaService.product.update.mockResolvedValue(updatedResult);

			const response = await service.update(productId, updateProductDto);

			expect(response).toEqual(updatedResult);
			expect(mockPrismaService.product.update).toHaveBeenCalledWith({
				where: { id: productId },
				data: {
					name: updateProductDto.name,
					stock: updateProductDto.stock,
					price: updateProductDto.price,
					specification: updateProductDto.specification,
					enable: updateProductDto.enable,
					category: {
						connect: { id: mockCategory.id },
					},
				},
				include: {
					picture: true,
					category: true,
				},
			});
		});

		it('should throw NotFoundException if product does not exist', async () => {
			const mockCategory = { id: 2, name: 'Category 2' };
			const productId = 1;
			const updateProductDto: UpdateProductDto = {
				name: 'Updated Product',
				stock: 20,
				price: 150,
				specification: 'Updated specifications',
				enable: false,
				category: mockCategory,
			};

			mockPrismaService.product.findUnique.mockResolvedValue(null);

			await expect(service.update(productId, updateProductDto)).rejects.toThrow(
				NotFoundException,
			);
			await expect(service.update(productId, updateProductDto)).rejects.toThrow(
				`Product with ID ${productId} not found`,
			);
		});

		it('should throw NotFoundException if category does not exist during update', async () => {
			const mockCategory = { id: 2, name: 'Category 2' };
			const productId = 1;
			const updateProductDto: UpdateProductDto = {
				name: 'Updated Product',
				stock: 20,
				price: 150,
				specification: 'Updated specifications',
				enable: false,
				category: mockCategory,
			};

			const mockExistingProduct = {
				id: productId,
				name: 'Old Product',
				stock: 10,
				price: 100,
				specification: 'Old specifications',
				enable: true,
				picture: [],
				category: { id: 1, name: 'Category 1' },
			};

			mockPrismaService.product.findUnique.mockResolvedValue(mockExistingProduct);
			mockCategoriesService.findOne.mockResolvedValue(null);

			await expect(service.update(productId, updateProductDto)).rejects.toThrow(
				NotFoundException,
			);
			await expect(service.update(productId, updateProductDto)).rejects.toThrow(
				`Category with ID ${updateProductDto.category.id} not found`,
			);
		});
	});

	describe('getAllProducts', () => {
		it('should return a paginated list of products', async () => {
			const paginationInput: PaginationInput = { first: 10, after: 'cursor-id' };
			const mockProducts: Product[] = [
				{
					id: 1,
					name: 'Product 1',
					specification: 'Description 1',
					price: 100,
					picture: [],
					category: {
						id: 1,
						name: 'category 1'
					},
					stock: 10, 
					enable: true, 
					createdAt: new Date(), 
					updatedAt: new Date
				},
				{
					id: 2,
					name: 'Product 2',
					specification: 'Description 2',
					price: 200,
					stock: 10, 
					enable: true, 
					createdAt: new Date(), 
					updatedAt: new Date,
					picture: [],
					category: {
						id: 1,
						name: 'category 1'
					},
				},
			];

			const mockProductEdges: ProductEdge[] = mockProducts.map(product => ({
				cursor: `cursor-${product.id}`,
				node: product,
			}));
			const mockPageInfo = {
				startCursor: mockProductEdges[0].cursor,
				endCursor: mockProductEdges[mockProductEdges.length - 1].cursor,
				hasNextPage: false,
				hasPreviousPage: false,
			};
			const mockProductConnection: ProductConnection = {
				edges: mockProductEdges,
				pageInfo: mockPageInfo,
			};

			mockPaginationService.paginate.mockResolvedValue(mockProductConnection);

			const result = await service.getAllProducts(paginationInput);

			expect(result).toEqual(mockProductConnection);
			expect(mockPaginationService.paginate).toHaveBeenCalledWith(
				expect.any(Function),
				paginationInput,
				'id',
				undefined,
				{ createdAt: 'asc' },
				{ picture: true, category: true },
			);
		});

		it('should return a filtered list of products by category', async () => {
			const mockCategory = { id: 2, name: 'Category 2' };
			const paginationInput: PaginationInput = { first: 10, after: 'cursor-id' };
			const categoryFilter: CategoryFilter = mockCategory;
			const mockProducts: Product[] = [
				{
					id: 1,
					name: 'Product 1',
					specification: 'Description 1',
					price: 100,
					picture: [],
					category: {
						id: 1,
						name: 'category 1'
					},
					stock: 10, 
					enable: true, 
					createdAt: new Date(), 
					updatedAt: new Date
				},
				{
					id: 2,
					name: 'Product 2',
					specification: 'Description 2',
					price: 200,
					stock: 10, 
					enable: true, 
					createdAt: new Date(), 
					updatedAt: new Date,
					picture: [],
					category: {
						id: 1,
						name: 'category 1'
					},
				},
			];
			const mockProductEdges: ProductEdge[] = mockProducts.map(product => ({
				cursor: `cursor-${product.id}`,
				node: product,
			}));
			const mockPageInfo = {
				startCursor: mockProductEdges[0].cursor,
				endCursor: mockProductEdges[mockProductEdges.length - 1].cursor,
				hasNextPage: false,
				hasPreviousPage: false,
			};
			const mockProductConnection: ProductConnection = {
				edges: mockProductEdges,
				pageInfo: mockPageInfo,
			};

			mockPaginationService.paginate.mockResolvedValue(mockProductConnection);

			const result = await service.getAllProducts(paginationInput, categoryFilter);

			expect(result).toEqual(mockProductConnection);
			expect(mockPaginationService.paginate).toHaveBeenCalledWith(
				expect.any(Function),
				paginationInput,
				'id',
				{ categoryId: categoryFilter.id },
				{ createdAt: 'asc' },
				{ picture: true, category: true },
			);
		});
	});

	describe('toggleProductEnableStatus', () => {
		it('should enable/disable a product and return the updated product', async () => {
			const id = 1;
			const enable = true;
			const mockProduct: Product = {
				id,
				name: 'Sample Product',
				stock: 10,
				price: 100,
				enable: !enable,
				picture: [],
				category: {
					id: 1,
					name: "category 1",
				},
				createdAt: new Date,
				updatedAt: new Date
			};

			mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
			mockPrismaService.product.update.mockResolvedValue({
				...mockProduct,
				enable,
			});

			const result = await service.toggleProductEnableStatus(id, enable);

			expect(result.enable).toBe(enable);
			expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
				where: { id },
			});
			expect(mockPrismaService.product.update).toHaveBeenCalledWith({
				where: { id },
				data: { enable },
				include: { picture: true, category: true },
			});
		});

		it('should throw NotFoundException if product does not exist', async () => {
			const id = 999;
			const enable = true;

			mockPrismaService.product.findUnique.mockResolvedValue(null);

			await expect(service.toggleProductEnableStatus(id, enable)).rejects.toThrow(NotFoundException);
		});
	});

	describe('toggleLikeProduct', () => {
		it('should like a product if not already liked', async () => {
			const userId = 1;
			const productId = 2;

			mockPrismaService.likeProduct.findUnique.mockResolvedValue(null);

			const result = await service.toggleLikeProduct(userId, productId);

			expect(result).toEqual({
				status: 'liked',
				message: 'Product liked successfully',
			});

			expect(mockPrismaService.likeProduct.create).toHaveBeenCalledWith({
				data: { userId, productId },
			});
		});

		it('should unlike a product if already liked', async () => {
			const userId = 1;
			const productId = 2;

			mockPrismaService.likeProduct.findUnique.mockResolvedValue({ userId, productId });

			const result = await service.toggleLikeProduct(userId, productId);

			expect(result).toEqual({
				status: 'unliked',
				message: 'Product unliked successfully',
			});

			expect(mockPrismaService.likeProduct.delete).toHaveBeenCalledWith({
				where: { userId_productId: { userId, productId } },
			});
		});
	});
});
