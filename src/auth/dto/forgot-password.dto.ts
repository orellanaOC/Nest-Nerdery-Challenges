/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import {
ApiProperty
} from '@nestjs/swagger';

export class ForgotPasswordDto {
	@ApiProperty({
required: true, example: 'john_doe@gmail.com'
})
	email: string;
}
