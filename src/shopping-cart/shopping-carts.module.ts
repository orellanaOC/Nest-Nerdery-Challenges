import { Module } from '@nestjs/common';
import { ShoppingCartResolver } from './shopping-cart/shopping-cart.resolver';
import { ShoppingCartsService } from './shopping-cart/shopping-cart.service';
import { ShoppingCartLinesModule } from './shopping-cart-lines/shopping-cart-lines/shopping-cart-lines.module';

@Module({
	imports: [ShoppingCartLinesModule],
	providers: [ShoppingCartResolver, ShoppingCartsService],
	exports: [ShoppingCartsService],
})
export class ShoppingCartsModule {}
