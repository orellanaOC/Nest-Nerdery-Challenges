import { Module } from '@nestjs/common';
import { ShoppingCartResolver } from './shopping-cart/shopping-cart.resolver';
import { ShoppingCartsService } from './shopping-cart/shopping-cart.service';
import { ShoppingCartLinesModule } from './shopping-cart-lines/shopping-cart-lines/shopping-cart-lines.module';
import { JwtService } from '@nestjs/jwt';

@Module({
	imports: [ShoppingCartLinesModule],
	providers: [ShoppingCartResolver, ShoppingCartsService, JwtService],
	exports: [ShoppingCartsService],
})
export class ShoppingCartsModule {}
