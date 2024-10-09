/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordResponseDto {
	@ApiProperty({ required: true })
	resetToken: string;

	@ApiProperty({ required: true })
	expiresAt: Date;
}
