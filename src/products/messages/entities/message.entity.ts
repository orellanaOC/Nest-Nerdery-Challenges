/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Message {
	@Field(() => String)
	status: string;

	@Field(() => String)
	message: string;
}
