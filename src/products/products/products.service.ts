import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { CategoriesService } from '../categories/categories.service';
import { Message } from '../messages/entities/message.entity';
import { PaginationInput } from 'src/pagination/dto/pagination-input.dto';
import { ProductConnection } from './dto/product-connection.entity';
import { PageInfoModel } from 'src/pagination/entities/page-info.entity';
import { PaginationService } from 'src/pagination/pagination/pagination.service';

@Injectable()
export class ProductsService {
	constructor(
		private prisma: PrismaService,
		private readonly categoriesService: CategoriesService,
		private readonly paginationService: PaginationService,
	) {}

	async findAll(): Promise<Product[]> {
		return this.prisma.product.findMany({
			include: {
				picture: true,
				category: true,
			},
		});
	}

	async findOne(id: number): Promise<Product> {
		const product = await this.prisma.product.findUnique({
			where: { id },
			include: {
				picture: true,
				category: true,
			},
		});

		if (!product) {
			throw new NotFoundException(`Product with ID ${id} not found`);
		}

		return product;
	}

	async create(data: CreateProductDto): Promise<Product> {
		const category = await this.categoriesService.findOne(data.category.id);

		if (!category) {
			throw new NotFoundException(
				`Category with ID ${data.category.id} not found`,
			);
		}

		return this.prisma.product.create({
			data: {
				...data,
				category: {
					connect: { id: category.id },
				},
			},
			include: {
				picture: true,
				category: true,
			},
		});
	}

	async update(id: number, data: UpdateProductDto): Promise<Product> {
		const product = await this.prisma.product.findUnique({
			where: { id },
			include: {
				category: true,
				picture: true,
			},
		});

		if (!product) {
			throw new NotFoundException(`Product with ID ${id} not found`);
		}

		let categoryId: number | undefined = undefined;

		if (data.category && data.category.id) {
			const category = await this.categoriesService.findOne(
				data.category.id,
			);

			if (!category) {
				throw new NotFoundException(
					`Category with ID ${data.category.id} not found`,
				);
			}

			categoryId = category.id;
		}

		return this.prisma.product.update({
			where: { id },
			data: {
				name: data.name,
				stock: data.stock,
				price: data.price,
				specification: data.specification,
				enable: data.enable,
				category: categoryId
					? { connect: { id: categoryId } }
					: undefined,
			},
			include: {
				picture: true,
				category: true,
			},
		});
	}

	async getAllProducts(filter?: PaginationInput): Promise<ProductConnection> {
		const { first, after, last, before } = filter || {};

		let cursor = after ? { id: Number(after) } : undefined;

		if (before) {
			cursor = { id: Number(before) };
		}

		let take = first || last || 10;
		if (last) {
			take = -take;
		}

		const skip = cursor ? 1 : 0;

		const products = await this.prisma.product.findMany({
			where: {},
			orderBy: {
				id: 'asc',
			},
			take,
			skip,
			cursor,
			include: {
				picture: true,
				category: true,
			},
		});

		const startCursor =
			products.length > 0 ? products[0].id.toString() : null;
		const endCursor =
			products.length > 0
				? products[products.length - 1].id.toString()
				: null;

		const hasNextPage = !!(await this.prisma.product.findFirst({
			where: {},
			cursor: { id: Number(endCursor) },
			skip: 1,
			orderBy: { id: 'asc' },
		}));

		const hasPreviousPage = !!(await this.prisma.product.findFirst({
			where: {},
			cursor: { id: Number(startCursor) },
			skip: 1,
			orderBy: { id: 'desc' },
		}));

		const pageInfo: PageInfoModel = {
			startCursor,
			endCursor,
			hasNextPage,
			hasPreviousPage,
		};

		const edges = products.map((product) => ({
			cursor: product.id.toString(),
			node: product,
		}));

		return {
			edges,
			pageInfo,
		};
	}

	async getProductById(id: number) {
		const product = this.prisma.product.findUnique({
			where: { id },
			include: {
				picture: true,
				category: true,
			},
		});

		if (!product) {
			throw new NotFoundException('Product not found');
		}

		return product;
	}

	async toggleProductEnableStatus(
		id: number,
		enable: boolean,
	): Promise<Product> {
		const product = await this.prisma.product.findUnique({
			where: { id },
		});

		if (!product) {
			throw new NotFoundException(`Product with ID ${id} not found`);
		}

		return this.prisma.product.update({
			where: { id },
			data: { enable },
			include: {
				picture: true,
				category: true,
			},
		});
	}

	async toggleLikeProduct(
		userId: number,
		productId: number,
	): Promise<Message> {
		// Check if the user has already liked this product
		const existingLike = await this.prisma.likeProduct.findUnique({
			where: {
				userId_productId: {
					userId,
					productId,
				},
			},
		});

		if (existingLike) {
			// If the product is already liked, remove the like
			await this.prisma.likeProduct.delete({
				where: {
					userId_productId: {
						userId,
						productId,
					},
				},
			});

			return {
				status: 'unliked',
				message: 'Product unliked successfully',
			};
		}

		// Save the like
		await this.prisma.likeProduct.create({
			data: {
				userId,
				productId,
			},
		});

		return { status: 'liked', message: 'Product liked successfully' };
	}
}
