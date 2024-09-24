import { Context, Query, Resolver } from '@nestjs/graphql';
import { ShoppingCart } from '../entities/shopping-cart.entity';
import { ShoppingCartsService } from './shopping-cart.service';

@Resolver()
export class ShoppingCartResolver {
	constructor(private readonly shoppingCartService: ShoppingCartsService) {}

	@Query(() => ShoppingCart)
	async getShoppingCart(/*@Context('req') req: any*/): Promise<ShoppingCart> {
		const userId = 1; //req.user.id; // Extract the user ID from the request header

		return this.shoppingCartService.getShoppingCartByUserId(userId);
	}
}
