/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ApiProperty } from "@nestjs/swagger";
import { IsStrongPassword } from "class-validator";

export class NewPasswordDto {
	@ApiProperty({ required: true, example: 'securePassword123' })
    @IsStrongPassword()
    newPassword: string;
}