import { Context, Query, Resolver } from '@nestjs/graphql';
import { ShoppingCart } from '../entities/shopping-cart.entity';
import { ShoppingCartsService } from './shopping-cart.service';

@Resolver()
export class ShoppingCartResolver {
	constructor(private readonly shoppingCartService: ShoppingCartsService) {}

	// TODO: add the header requirement
	@Query(() => ShoppingCart)
	async myShoppingCart(/*@Context('req') req: any*/): Promise<ShoppingCart> {
		const userId = 1; //req.user.id; // Extract the user ID from the request header

		return this.shoppingCartService.getShoppingCartByUserId(userId);
	}
}
