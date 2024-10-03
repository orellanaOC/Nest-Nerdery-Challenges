import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { CategoriesService } from '../categories/categories.service';
import { Message } from '../messages/entities/message.entity';
import { PaginationInput } from 'src/pagination/dto/pagination-input.dto';
import { ProductConnection } from './dto/product-connection.entity';
import { PaginationService } from 'src/pagination/pagination/pagination.service';
import { Prisma } from '@prisma/client';

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

	async getAllProducts(
		pagination?: PaginationInput,
	): Promise<ProductConnection> {
		return this.paginationService.paginate<
			Product,
			Prisma.ProductFindManyArgs
		>(
			this.prisma.product.findMany.bind(this.prisma.product),
			pagination,
			'id', // Cursor field
			undefined, // Where clause (optional)
			{ createdAt: 'asc' } as Prisma.ProductOrderByWithRelationInput, // OrderBy clause (optional)
			{ picture: true, category: true }, // Include clause to fetch related picture and category
		);
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
		const existingLike = await this.prisma.likeProduct.findUnique({
			where: {
				userId_productId: {
					userId,
					productId,
				},
			},
		});

		if (existingLike) {
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
