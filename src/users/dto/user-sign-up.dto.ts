/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsStrongPassword } from "class-validator";

export class UserSignUpDto {
	@ApiProperty({ required: true, example: 'John Doe' })
    @IsString()
    name: string;

	@ApiProperty({ required: true, example: 'john_doe@gmail.com' })
    @IsEmail()
    email: string;

	@ApiProperty({ required: true, example: 'securePassword123' })
    @IsStrongPassword()
    password: string;
}