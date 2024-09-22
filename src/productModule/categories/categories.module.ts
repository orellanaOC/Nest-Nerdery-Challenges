import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
	providers: [CategoriesService, PrismaService],
	exports: [CategoriesService],
})
export class CategoriesModule {}
