/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ApiProperty } from "@nestjs/swagger";

export class MessageResponseDto {
	@ApiProperty({ required: true, example: 'Error message' })
    message: string;
}