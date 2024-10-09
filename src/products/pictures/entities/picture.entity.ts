/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Picture {
	@Field(() => Int)
	id: number;

	@Field(() => Int)
	productId: number;

	@Field(() => String)
	imageUrl: string;

	@Field()
	createdAt: Date;
}
