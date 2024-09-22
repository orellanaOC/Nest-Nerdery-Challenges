import { Module } from '@nestjs/common';
import { ProductsResolver } from './products/products.resolver';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductsService } from './products/products.service';
import { CategoriesModule } from './categories/categories.module';

@Module({
	imports: [CategoriesModule],
	providers: [ProductsService, ProductsResolver, PrismaService],
})
export class ProductsModule {}
