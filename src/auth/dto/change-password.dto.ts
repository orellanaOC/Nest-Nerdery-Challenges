/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ApiProperty } from "@nestjs/swagger";

export class ChangePasswordDto {
	@ApiProperty({ required: true, example: 'securePassword123' })
    currentPassword: string;

	@ApiProperty({ required: true, example: 'moreSecurePassword123' })
    newPassword: string;
}