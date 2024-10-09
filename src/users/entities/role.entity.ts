/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Role {
	@Field(() => Int)
	id: number;

	@Field(() => String)
	name: string;
}
