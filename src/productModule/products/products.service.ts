import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product.entity';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ProductsService {
	constructor(
		private prisma: PrismaService,
		private readonly categoriesService: CategoriesService,
	) {}

	async findAll(): Promise<Product[]> {
		return this.prisma.product.findMany();
	}

	async findOne(id: number): Promise<Product> {
		const product = await this.prisma.product.findUnique({
			where: { id },
		});

		if (!product) {
			throw new NotFoundException(`Product with ID ${id} not found`);
		}

		return product;
	}

	async create(data: CreateProductDto): Promise<Product> {
		const category = await this.categoriesService.findOne(data.categoryId);

		if (!category) {
			throw new NotFoundException(
				`Category with ID ${data.categoryId} not found`,
			);
		}
		return this.prisma.product.create({
			data: {
				...data,
			},
		});
	}

	async update(id: number, data: UpdateProductDto): Promise<Product> {
		const product = await this.prisma.product.findUnique({
			where: { id },
		});

		if (!product) {
			throw new NotFoundException(`Product with ID ${id} not found`);
		}

		if (data.categoryId) {
			const category = await this.categoriesService.findOne(
				data.categoryId,
			);
			if (!category) {
				throw new NotFoundException(
					`Category with ID ${data.categoryId} not found`,
				);
			}
		}

		return this.prisma.product.update({
			where: { id },
			data: {
				...data,
			},
		});
	}

	async getAllProducts() {
		return this.prisma.product.findMany();
	}

	async getProductById(id: number) {
		return this.prisma.product.findUnique({
			where: { id },
		});
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
		});
	}
}
