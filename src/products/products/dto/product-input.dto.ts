/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { Field, Int, InputType } from '@nestjs/graphql';
import { CategoryInput } from 'src/products/categories/dto/category-input.dto';

@InputType()
export class ProductInput {
	@Field(() => Int)
	id: number;

	@Field(() => String)
	name: string;

	@Field(() => Int)
	price: number;

	@Field(() => Int)
	stock: number;

	@Field(() => CategoryInput)
	category: CategoryInput;
}
