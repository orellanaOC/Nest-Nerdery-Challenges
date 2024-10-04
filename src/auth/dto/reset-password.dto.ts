/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ApiProperty } from "@nestjs/swagger";
import { IsStrongPassword } from "class-validator";

export class ResetPasswordDto {
	@ApiProperty({ required: true, example: 'securePassword123*' })
    currentPassword: string;

	@ApiProperty({ required: true, example: 'moreSecurePassword123*' })
    @IsStrongPassword()
    newPassword: string;
}