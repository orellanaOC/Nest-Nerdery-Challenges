import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductsService {
	constructor(private prisma: PrismaService) {}

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
		return this.prisma.product.create({
			data: {
				...data,
			},
		});
	}

	async update(id: number, data: UpdateProductDto): Promise<Product> {
		const productExists = await this.prisma.product.findUnique({
			where: { id },
		});

		if (!productExists) {
			throw new NotFoundException(`Product with ID ${id} not found`);
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
}
