/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
	@ApiProperty({ required: true, example: 1 })
    id: number;

	@ApiProperty({ required: true, example: 'John Doe' })
    name: string;

	@ApiProperty({ required: true, example: 'john_doe@gmail.com' })
    email: string;
}