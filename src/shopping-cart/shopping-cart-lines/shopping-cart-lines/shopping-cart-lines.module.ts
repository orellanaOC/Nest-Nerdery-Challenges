import {
	Module
} from '@nestjs/common';
import {
	ProductsModule
} from 'src/products/products.module';
import {
	ShoppingCartLinesResolver
} from './shopping-cart-lines.resolver';
import {
	ShoppingCartLinesService
} from './shopping-cart-lines.service';
import {
	PicturesService
} from 'src/products/pictures/pictures.service';

@Module({
	imports: [ProductsModule],
	providers: [
		ShoppingCartLinesResolver,
		ShoppingCartLinesService,
		PicturesService,
	],
	exports: [ShoppingCartLinesService],
})
export class ShoppingCartLinesModule {}
