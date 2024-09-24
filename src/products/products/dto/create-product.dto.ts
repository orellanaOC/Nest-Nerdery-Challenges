/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsInt } from 'class-validator';
import { CategoryInput } from 'src/products/categories/entities/category.entity';

@InputType()
export class CreateProductDto {
	@Field({ nullable: false })
    @IsNotEmpty()
	name: string;

	@Field({ nullable: true })
	specification?: string;

	@Field(() => Int)
    @IsInt()
	price: number;

	@Field(() => Int)
    @IsInt()
	stock: number;

	@Field(() => CategoryInput, { nullable: false })
	category: CategoryInput;
}
