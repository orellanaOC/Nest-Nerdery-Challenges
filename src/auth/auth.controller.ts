import {
	Controller,
	Post,
	Body,
	HttpCode,
	UseGuards,
	Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserSignUpDto } from '../users/dto/user-sign-up.dto';
import { UserSignInDto } from '../users/dto/user-sign-in.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiForbiddenResponse,
	ApiInternalServerErrorResponse,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SignUpResponseDto } from './dto/sign-up-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { SignInResponseDto } from './dto/sign-in-response.dto';
import { ForgotPasswordResponseDto } from './dto/forgot-password-response.dto';

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
		description:
			'Bad request. Missing or invalid fields. Ensure that all required fields such as name, email, and password are provided and valid.',
		type: MessageResponseDto,
	})
	@ApiConflictResponse({
		description:
			'Conflict. The email already exists in the system. Please use a different email address to register.',
		type: MessageResponseDto,
	})
	@ApiInternalServerErrorResponse({
		description:
			'Internal server error. An unexpected error occurred during registration. Please try again later.',
		type: MessageResponseDto,
	})
	async signUp(
		@Body() userSignUpDto: UserSignUpDto,
	): Promise<SignUpResponseDto | MessageResponseDto> {
		return this.authService.signUp(userSignUpDto);
	}

	@Post('sign-in')
	@ApiUnauthorizedResponse({
		description:
			'Invalid credentials. Either the email or password provided is incorrect.',
		type: MessageResponseDto,
	})
	@ApiForbiddenResponse({
		description:
			'Forbidden. Please verify your email before attempting to sign in.',
		type: MessageResponseDto,
	})
	@ApiInternalServerErrorResponse({
		description:
			'Internal server error. Could not generate the authentication token. Please try again later.',
		type: MessageResponseDto,
	})
	async signIn(
		@Body() userSignInDto: UserSignInDto,
	): Promise<SignInResponseDto | MessageResponseDto> {
		return this.authService.signIn(userSignInDto);
	}

	@Post('forgot-password')
	@ApiInternalServerErrorResponse({
		description:
			'An unexpected error occurred while generating the reset token. Please try again later.',
		type: MessageResponseDto,
	})
	async forgotPassword(
		@Body() forgotPasswordDto: ForgotPasswordDto,
	): Promise<ForgotPasswordResponseDto | MessageResponseDto> {
		return this.authService.forgotPassword(forgotPasswordDto);
	}

	@Post('new-password')
	@ApiBadRequestResponse({
		description:
			'Invalid or expired reset token. Please request a new password reset token and try again.',
		type: MessageResponseDto,
	})
	@ApiUnauthorizedResponse({
		description:
			'Authentication failed. The provided token is invalid or expired. Please try again with a valid token.',
		type: MessageResponseDto,
	})
	@ApiInternalServerErrorResponse({
		description:
			'Could not save the new password. An unexpected error occurred while updating the password. Please try again later.',
		type: MessageResponseDto,
	})
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	async newPassword(
		@Body() newPasswordDto: NewPasswordDto,
		@Request() req,
	): Promise<MessageResponseDto> {
		const resetToken = req.headers.authorization.split(' ')[1];
		return this.authService.newPassword(resetToken, newPasswordDto);
	}

	@Post('reset-password')
	@ApiBadRequestResponse({
		description:
			'Invalid request. Ensure that both the current and new passwords are provided.',
		type: MessageResponseDto,
	})
	@ApiUnauthorizedResponse({
		description:
			'Authentication failed. Invalid Bearer token provided. Ensure the token is valid and has not expired.',
		type: MessageResponseDto,
	})
	@ApiInternalServerErrorResponse({
		description:
			'Could not change the password due to an unexpected error. Please try again later.',
		type: MessageResponseDto,
	})
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	async resetPassword(
		@Body() resetPasswordDto: ResetPasswordDto,
		@Request() req,
	): Promise<MessageResponseDto> {
		const token = req.headers.authorization.split(' ')[1];
		return this.authService.resetPassword(token, resetPasswordDto);
	}

	@Post('sign-out')
	@HttpCode(200)
	@ApiUnauthorizedResponse({
		description:
			'Authentication failed. Invalid or missing Bearer token. Please provide a valid token to sign out.',
		type: MessageResponseDto,
	})
	@ApiInternalServerErrorResponse({
		description:
			'Could not sign out due to an unexpected server error. Please try again later.',
		type: MessageResponseDto,
	})
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	async signOut(@Request() req): Promise<MessageResponseDto> {
		const token = req.headers.authorization.split(' ')[1];
		return this.authService.signOut(token);
	}
}
