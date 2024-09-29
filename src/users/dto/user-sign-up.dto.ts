/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ApiProperty } from "@nestjs/swagger";

export class UserSignUpDto {
	@ApiProperty({ required: true, example: 'John Doe' })
    name: string;

	@ApiProperty({ required: true, example: 'john_doe@gmail.com' })
    email: string;

	@ApiProperty({ required: true, example: 'securePassword123' })
    password: string;
}