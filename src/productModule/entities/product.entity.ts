/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Product {
    @Field(() => Int)
    id: number;

    @Field()
    name: string;

    @Field({ nullable: true })
    specification?: string;

    @Field(() => Int)
    price: number;

    @Field(() => Int)
    stock: number;

    @Field(() => Int)
    categoryId: number;

    @Field()
    enable: boolean;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
