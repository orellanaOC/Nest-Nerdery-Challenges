/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Category {
    @Field(() => Int)
    id: number;

    @Field()
    name: string;
}
