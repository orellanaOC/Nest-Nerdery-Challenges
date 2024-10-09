/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class SignUpResponseDto {
	@ApiProperty({ required: true })
	user: UserResponseDto;

	@ApiProperty({ required: true, example: 1 })
	cartId: number;
}
