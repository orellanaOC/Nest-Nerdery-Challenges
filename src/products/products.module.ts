import { Module } from '@nestjs/common';
import { ProductsResolver } from './products/products.resolver';
import { ProductsService } from './products/products.service';
import { CategoriesModule } from './categories/categories.module';
import { PicturesModule } from './pictures/pictures.module';
import { PaginationModule } from 'src/pagination/pagination.module';

@Module({
	imports: [CategoriesModule, PicturesModule, PaginationModule],
	providers: [ProductsService, ProductsResolver],
	exports: [ProductsService],
})
export class ProductsModule {}
