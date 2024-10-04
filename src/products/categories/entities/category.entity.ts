/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ObjectType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsString } from 'class-validator';

@ObjectType()
export class Category {
    @Field(() => Int)
    @IsInt()
    id: number;

    @Field(() => String)
    @IsString()
    name: string;
}
