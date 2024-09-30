import {
	Controller,
	Post,
	Body,
	HttpCode,
	UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserSignUpDto } from '../users/dto/user-sign-up.dto';
import { UserSignInDto } from '../users/dto/user-sign-in.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
	ApiBadRequestResponse,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiForbiddenResponse,
	ApiInternalServerErrorResponse,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SignUpResponseDto } from './dto/sign-up-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('sign-up')
	@ApiCreatedResponse({
		description: 'User successfully registered and shopping cart created.',
		type: SignUpResponseDto,
	})
	@ApiBadRequestResponse({
		description: 'Bad request. Missing or invalid fields.',
		type: MessageResponseDto,
	})
	@ApiConflictResponse({
		description: 'Conflict - email already exists. No new user created.',
		type: MessageResponseDto,
	})
	@ApiInternalServerErrorResponse({
		description:
			'Internal server error. An unexpected error occurred on the server.',
		type: MessageResponseDto,
	})
	async signUp(
		@Body() userSignUpDto: UserSignUpDto,
	): Promise<SignUpResponseDto | MessageResponseDto> {
		return this.authService.signUp(userSignUpDto);
	}

	@Post('sign-in')
	@ApiForbiddenResponse({
		description: 'Please verify your email before signing in.',
		type: MessageResponseDto,
	})
	@ApiUnauthorizedResponse({
		description: 'Invalid credentials.',
		type: MessageResponseDto,
	})
	@ApiInternalServerErrorResponse({
		description: 'Could not generate authentication token.',
		type: MessageResponseDto,
	})
	async signIn(@Body() userSignInDto: UserSignInDto) {
		return this.authService.signIn(userSignInDto);
	}

	@Post('forgot-password')
	async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
		// TODO
	}

	@Post('new-password')
	async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
		// TODO
	}

	@Post('reset-password')
	async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
		// TODO
	}

	@Post('sign-out')
	@HttpCode(200)
	async signOut() {
		// TODO
		// Implementación de sign out (invalida el token)
	}
}
