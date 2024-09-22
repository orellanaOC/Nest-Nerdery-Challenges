import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoriesService {
	constructor(private prisma: PrismaService) {}

	async findOne(id: number): Promise<Category> {
		const category = await this.prisma.category.findUnique({
			where: { id },
		});

		if (!category) {
			throw new NotFoundException(`Category with ID ${id} not found`);
		}

		return category;
	}
}
