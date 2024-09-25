/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Role } from './role.entity';

@ObjectType()
export class User {
    @Field(() => Int)
    id: number;

    @Field(() => Role)
    role: Role;

    @Field(() => String)
    name: string;

    @Field(() => String)
    email: string;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}