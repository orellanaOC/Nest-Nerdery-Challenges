/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import {
	Field, Int, InputType 
} from '@nestjs/graphql';
import {
IsInt, IsString
} from 'class-validator';

@InputType()
export class CategoryInput {
	@Field(() => Int)
	@IsInt()
	id: number;

	@Field(() => String)
	@IsString()
	name: string;
}
