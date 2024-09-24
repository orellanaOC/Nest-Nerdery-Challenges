/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreatePictureDto {
    @Field(() => Int, { nullable: false })
    productId: number;

    @Field(() => String, { nullable: false })
	@IsNotEmpty()
	@IsString()
    imageUrl: string;
}
