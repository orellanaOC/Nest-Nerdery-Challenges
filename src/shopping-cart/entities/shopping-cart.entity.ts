/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ShoppingCartLine } from '../shopping-cart-lines/entities/shopping-cart-line.entity';

@ObjectType()
export class ShoppingCart {
    @Field(() => Int)
    id: number;

    @Field(() => Int)
    totalAmount: number;

    @Field(() => [ShoppingCartLine], { nullable: 'items' })
    lines: ShoppingCartLine[];
}
