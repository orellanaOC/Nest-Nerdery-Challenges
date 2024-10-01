/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ApiProperty } from "@nestjs/swagger";

export class SignInResponseDto {
	@ApiProperty({ required: true })
    accessToken: string;
}