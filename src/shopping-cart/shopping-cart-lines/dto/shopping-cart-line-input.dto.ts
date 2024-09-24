/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { Field, Int, InputType } from '@nestjs/graphql';
import { IsInt, IsNotEmpty } from 'class-validator';
import { ProductInput } from 'src/products/products/dto/product-input.dto';

@InputType()
export class ShoppingCartLineInput {
    @Field()
    @IsNotEmpty()
    product: ProductInput;

    @Field(() => Int)
    @IsInt()
    productQuantity: number;
}
