import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ShoppingCart } from '../entities/shopping-cart.entity';
import { ShoppingCartsService } from './shopping-cart.service';
import { ShoppingCartLineInput } from '../shopping-cart-lines/dto/shopping-cart-line-input.dto';

@Resolver()
export class ShoppingCartResolver {
	constructor(private readonly shoppingCartService: ShoppingCartsService) {}
	// TODO: add the header requirement
	@Query(() => ShoppingCart)
	async myShoppingCart(/*@Context('req') req: any*/): Promise<ShoppingCart> {
		const userId = 1; //req.user.id; // Extract the user ID from the request header

		return this.shoppingCartService.getShoppingCartByUserId(userId);
	}

	@Mutation(() => ShoppingCart)
	async updateShoppingCart(
		// prettier-ignore
		@Args('shoppingCartLineInput') shoppingCartLineInput: ShoppingCartLineInput,
		// @Context() context: any,
	): Promise<ShoppingCart> {
		//const userId = context.req.headers['user-id']; // Extraer el userId desde el header
		const userId = 1;
		if (!userId) {
			throw new Error('User ID is missing in the request header');
		}

		return this.shoppingCartService.updateShoppingCart(
			userId,
			shoppingCartLineInput,
		);
	}
}
