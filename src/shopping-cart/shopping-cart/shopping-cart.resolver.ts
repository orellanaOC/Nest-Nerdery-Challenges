import {
	Args, Context, Mutation, Query, Resolver 
} from '@nestjs/graphql';
import {
	ShoppingCart
} from '../entities/shopping-cart.entity';
import {
	ShoppingCartsService
} from './shopping-cart.service';
import {
	ShoppingCartLineInput
} from '../shopping-cart-lines/dto/shopping-cart-line-input.dto';
import {
	BadRequestException, UseGuards
} from '@nestjs/common';
import {
	GqlAuthGuard
} from 'src/auth/guards/gql-auth.guard';

@Resolver()
export class ShoppingCartResolver {
	constructor(private readonly shoppingCartService: ShoppingCartsService) {}

	@Query(() => ShoppingCart)
	@UseGuards(GqlAuthGuard)
	async myShoppingCart(@Context() context: any): Promise<ShoppingCart> {
		try {
			const {
				user
			} = context.req;

			return this.shoppingCartService.getShoppingCartByUserId(
				user.userId,
			);
		} catch {
			throw new BadRequestException('Invalid token');
		}
	}

	@Mutation(() => ShoppingCart)
	@UseGuards(GqlAuthGuard)
	async updateShoppingCart(
		// prettier-ignore
		@Args('shoppingCartLineInput') shoppingCartLineInput: ShoppingCartLineInput,
		@Context() context: any,
	): Promise<ShoppingCart> {
		try {
			const {
				user
			} = context.req;

			return await this.shoppingCartService.updateShoppingCart(
				user.userId,
				shoppingCartLineInput,
			);
		} catch (error) {
			console.error('Error en updateShoppingCart:', error);
			throw new BadRequestException('Invalid token or other error');
		}
	}
}
