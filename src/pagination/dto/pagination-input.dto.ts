/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class PaginationInput {
	@Field(() => Int, { nullable: true })
	first?: number;

	@Field(() => String, { nullable: true })
	after?: string;

	@Field(() => Int, { nullable: true })
	last?: number;

	@Field(() => String, { nullable: true })
	before?: string;
}
