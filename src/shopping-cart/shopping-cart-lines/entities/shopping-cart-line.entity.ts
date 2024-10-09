/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Product } from 'src/products/products/entities/product.entity';

@ObjectType()
export class ShoppingCartLine {
	@Field(() => Int)
	id: number;

	@Field(() => Int)
	shoppingCartId: number;

	@Field()
	product: Product;

	@Field(() => Int)
	productQuantity: number;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}
