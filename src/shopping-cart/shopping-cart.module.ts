import { Module } from '@nestjs/common';
import { ShoppingCartLinesService } from './shopping-cart-lines/shopping-cart-lines/shopping-cart-lines.service';
import { ShoppingCartLinesResolver } from './shopping-cart-lines/shopping-cart-lines/shopping-cart-lines.resolver';
import { ShoppingCartResolver } from './shopping-cart/shopping-cart.resolver';
import { ShoppingCartsService } from './shopping-cart/shopping-cart.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
	providers: [
		ShoppingCartResolver,
		ShoppingCartsService,
		ShoppingCartLinesResolver,
		ShoppingCartLinesService,
		PrismaService,
	],
	exports: [ShoppingCartsService],
})
export class CategoriesModule {}
