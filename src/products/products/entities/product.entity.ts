/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Category } from 'src/products/categories/entities/category.entity';
import { Picture } from 'src/products/pictures/entities/picture.entity';

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

    @Field(() => Category)
    category: Category;

    @Field()
    enable: boolean;

    @Field(() => [Picture], { nullable: 'items' })
    picture: Picture[];

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
