import { Module } from '@nestjs/common';
import { ProductsResolver } from './products/products.resolver';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductsService } from './products/products.service';
import { CategoriesModule } from './categories/categories.module';
import { PicturesModule } from './pictures/pictures.module';

@Module({
	imports: [CategoriesModule, PicturesModule],
	providers: [ProductsService, ProductsResolver, PrismaService],
	exports: [ProductsService],
})
export class ProductsModule {}
