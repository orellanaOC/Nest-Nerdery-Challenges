import {
	Module
} from '@nestjs/common';
import {
	ProductsResolver
} from './products/products.resolver';
import {
	ProductsService
} from './products/products.service';
import {
	CategoriesModule
} from './categories/categories.module';
import {
	PicturesModule
} from './pictures/pictures.module';
import {
	PaginationModule
} from 'src/pagination/pagination.module';
import {
	JwtService
} from '@nestjs/jwt';

@Module({
	imports: [CategoriesModule, PicturesModule, PaginationModule],
	providers: [ProductsService, ProductsResolver, JwtService],
	exports: [ProductsService],
})
export class ProductsModule {}
