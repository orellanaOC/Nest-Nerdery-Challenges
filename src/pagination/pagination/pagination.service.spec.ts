import {
	Test, TestingModule
} from '@nestjs/testing';
import {
	PaginationService
} from './pagination.service';
import { PaginationInput } from '../dto/pagination-input.dto';
import { IPaginatedType } from '../entities/pagination.interface';
import { Product } from 'src/products/products/entities/product.entity';

describe('PaginationService', () => {
	let service: PaginationService;
	const mockPrismaService = {
		product: {
			findMany: jest.fn(),
		},
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [PaginationService],
		}).compile();

		service = module.get<PaginationService>(PaginationService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('paginate', () => {
		beforeEach(() => {
			jest.useFakeTimers();
			jest.setSystemTime(new Date('2024-10-11T18:12:33.167Z'));
		});
	
		afterEach(() => {
			jest.useRealTimers();
		});
		it('should return paginated results with forward pagination', async () => {
			const paginationInput: PaginationInput = { first: 2 };
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
					updatedAt: new Date()
				},
				{
					id: 2,
					name: 'Product 2',
					specification: 'Description 2',
					price: 200,
					stock: 10, 
					enable: true, 
					createdAt: new Date(),
					updatedAt: new Date(), 
					picture: [],
					category: {
						id: 1,
						name: 'category 1'
					},
				},
			];

			mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
	
			const result: IPaginatedType<Product> = await service.paginate(
				mockPrismaService.product.findMany.bind(mockPrismaService.product),
				paginationInput,
				'id',
			);
	
			expect(result).toEqual({
				edges: [
					{
						cursor: '1',
						node: {
							id: 1,
							name: 'Product 1',
							category: {
								id: 1,
								name: 'category 1',
							},
							createdAt: expect.any(Date),
							enable: true,
							price: 100,
							specification: 'Description 1',
							stock: 10,
							picture: [],
							updatedAt: expect.any(Date),
						},
					},
					{
						cursor: '2',
						node: {
							id: 2,
							name: 'Product 2',
							category: {
								id: 1,
								name: 'category 1',
							},
							createdAt: expect.any(Date),
							enable: true,
							price: 200,
							specification: 'Description 2',
							stock: 10,
							picture: [],
							updatedAt: expect.any(Date),
						},
					},
				],
				pageInfo: {
					endCursor: '2',
					hasNextPage: true,
					hasPreviousPage: true, 
					startCursor: '1',
				},
			});
		});

		it('should return paginated results with backward pagination', async () => {
			const paginationInput: PaginationInput = {
				last: 2,
				before: '4',
			};
			const mockFindMany = jest.fn().mockResolvedValue([
				{
					id: 3,
					name: 'Product 3',
					category: {
						id: 1,
						name: 'category 1',
					},
					createdAt: expect.any(Date),
					enable: true,
					price: 100,
					specification: 'Description 3',
					stock: 10,
					picture: [],
					updatedAt: expect.any(Date),
				},{
					id: 4,
					name: 'Product 4',
					category: {
						id: 1,
						name: 'category 1',
					},
					createdAt: expect.any(Date),
					enable: true,
					price: 200,
					specification: 'Description 4',
					stock: 10,
					picture: [],
					updatedAt: expect.any(Date),
				},
			]);

			const result: IPaginatedType<Product> = await service.paginate(
				mockFindMany,
				paginationInput,
				'id',
			);

			expect(result).toEqual({
				edges: [
					{
						cursor: '3',
						node: {
							id: 3,
							name: 'Product 3',
							category: {
								id: 1,
								name: 'category 1',
							},
							createdAt: expect.any(Date),
							enable: true,
							price: 100,
							specification: 'Description 3',
							stock: 10,
							picture: [],
							updatedAt: expect.any(Date),
						},
					},
					{
						cursor: '4',
						node: {
							id: 4,
							name: 'Product 4',
							category: {
								id: 1,
								name: 'category 1',
							},
							createdAt: expect.any(Date),
							enable: true,
							price: 200,
							specification: 'Description 4',
							stock: 10,
							picture: [],
							updatedAt: expect.any(Date),
						},
					},
				],
				pageInfo: {
					startCursor: '3',
					endCursor: '4',
					hasNextPage: true,
					hasPreviousPage: true,
				},
			});

			expect(mockFindMany).toHaveBeenCalledWith({
				where: undefined,
				orderBy: { id: 'asc' },
				take: -2,
				skip: 1,
				cursor: { id: 4 },
				include: undefined,
			});
		});

		it('should handle no results', async () => {
			const mockFindMany = jest.fn().mockResolvedValue([]);

			const paginationInput: PaginationInput = {
				first: 2,
				after: undefined,
			};

			const result: IPaginatedType<any> = await service.paginate(
				mockFindMany,
				paginationInput,
				'id'
			);

			expect(result).toEqual({
				edges: [],
				pageInfo: {
					startCursor: null,
					endCursor: null,
					hasNextPage: false,
					hasPreviousPage: false,
				},
			});

			expect(mockFindMany).toHaveBeenCalledWith({
				where: undefined,
				orderBy: { id: 'asc' },
				take: 2,
				skip: 0,
				cursor: undefined,
				include: undefined,
			});
		});
        
		it('should handle filtering by category', async () => {
			const mockFindMany = jest.fn().mockResolvedValue([
				{
					id: 1,
					name: 'Product 1',
					category: {
						id: 1,
						name: 'category 1',
					},
					createdAt: expect.any(Date),
					enable: true,
					price: 100,
					specification: 'Description 1',
					stock: 10,
					picture: [],
					updatedAt: expect.any(Date),
				},
				{
					id: 2,
					name: 'Product 2',
					category: {
						id: 1,
						name: 'category 1',
					},
					createdAt: expect.any(Date),
					enable: true,
					price: 200,
					specification: 'Description 2',
					stock: 10,
					picture: [],
					updatedAt: expect.any(Date),
				},
			]);

			const paginationInput: PaginationInput = {
				first: 2,
				after: undefined,
			};

			const result: IPaginatedType<any> = await service.paginate(
				mockFindMany,
				paginationInput,
				'id',
				{ categoryId: 1 }
			);

			expect(result).toEqual({
				edges: [
					{
						cursor: '1',
						node: {
							id: 1,
							name: 'Product 1',
							category: {
								id: 1,
								name: 'category 1',
							},
							createdAt: expect.any(Date),
							enable: true,
							price: 100,
							specification: 'Description 1',
							stock: 10,
							picture: [],
							updatedAt: expect.any(Date),
						},
					},
					{
						cursor: '2',
						node: {
							id: 2,
							name: 'Product 2',
							category: {
								id: 1,
								name: 'category 1',
							},
							createdAt: expect.any(Date),
							enable: true,
							price: 200,
							specification: 'Description 2',
							stock: 10,
							picture: [],
							updatedAt: expect.any(Date),
						},
					},
				],
				pageInfo: {
					startCursor: '1',
					endCursor: '2',
					hasNextPage: true,
					hasPreviousPage: true,
				},
			});

			expect(mockFindMany).toHaveBeenCalledWith({
				where: { categoryId: 1 },
				orderBy: { id: 'asc' },
				take: 2,
				skip: 0,
				cursor: undefined,
				include: undefined,
			});
		});
	});
});
