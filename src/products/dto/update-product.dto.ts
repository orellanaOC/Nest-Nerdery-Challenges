/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class UpdateProductDto {
    @Field({ nullable: true })
    @IsOptional()
    name?: string;

    @Field({ nullable: true })
    @IsOptional()
    specification?: string;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    @IsInt()
    price?: number;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    @IsInt()
    stock?: number;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    @IsInt()
    categoryId?: number;

    @Field({ nullable: true })
    @IsOptional()
    @IsBoolean()
    enable?: boolean;
}
