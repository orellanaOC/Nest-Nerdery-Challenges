/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ApiProperty } from "@nestjs/swagger";

export class UserSignInDto {
	@ApiProperty({ required: true, example: 'john_doe@gmail.com' })
    email: string;

	@ApiProperty({ required: true, example: 'securePassword123' })
    password: string;
}