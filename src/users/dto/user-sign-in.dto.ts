/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import {
ApiProperty
} from '@nestjs/swagger';
import {
IsEmail, IsStrongPassword
} from 'class-validator';

export class UserSignInDto {
	@ApiProperty({
required: true, example: 'john_doe@gmail.com'
})
	@IsEmail()
	email: string;

	@ApiProperty({
required: true, example: 'securePassword123*'
})
	@IsStrongPassword()
	password: string;
}
