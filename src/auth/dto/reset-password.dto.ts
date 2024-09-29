/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordDto {
	@ApiProperty({ required: true, example: 'securePassword123' })
    newPassword: string;
}