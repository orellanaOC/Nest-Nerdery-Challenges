/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Product } from 'src/products/products/entities/product.entity';

@ObjectType()
export class OrderLine {
    @Field(() => Int)
    id: number;

    @Field(() => Int)
    orderId: number;

    @Field()
    product: Product;

    @Field(() => Int)
    productQuantity: number;

    @Field(() => Int)
    pricePerItem: number;

    @Field(() => Int)
    subTotal: number;

    @Field()
    createdAt: Date;
}
