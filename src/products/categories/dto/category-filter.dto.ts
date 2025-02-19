/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import {
 InputType, Field, Int 
} from '@nestjs/graphql';

@InputType()
export class CategoryFilter {
	@Field(() => Int, { nullable: true })
	id?: number;

	@Field(() => String, { nullable: true })
	name?: string;
}
