import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	forwardRef,
	Inject,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
	JwtService
} from '@nestjs/jwt';
import {
	PrismaService
} from 'prisma/prisma/prisma.service';
import {
	UserSignUpDto
} from '../users/dto/user-sign-up.dto';
import {
	UserSignInDto
} from '../users/dto/user-sign-in.dto';
import {
	SignUpResponseDto
} from './dto/sign-up-response.dto';
import {
	MessageResponseDto
} from './dto/message-response.dto';
import {
	UsersService
} from 'src/users/users/users.service';
import {
	ForgotPasswordDto
} from './dto/forgot-password.dto';
import {
	v4 as uuidv4
} from 'uuid';
import {
	SignInResponseDto
} from './dto/sign-in-response.dto';
import {
	ForgotPasswordResponseDto
} from './dto/forgot-password-response.dto';
import {
	ResetPasswordDto
} from './dto/reset-password.dto';
import {
	NewPasswordDto
} from './dto/new-password.dto';

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
		@Inject(forwardRef(() => UsersService))
		private readonly usersService: UsersService,
	) {}

	async signUp(
		userSignUpDto: UserSignUpDto,
	): Promise<SignUpResponseDto | MessageResponseDto> {
		const {
			name, email, password 
		} = userSignUpDto;

		if (!name || !email || !password) {
			throw new BadRequestException(
				'Missing required fields: name, email, or password.',
			);
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			throw new BadRequestException('Invalid email format.');
		}

		if (password.length < 8) {
			throw new BadRequestException(
				'Password must be at least 8 characters long.',
			);
		}

		const existingUser = await this.prisma.user.findUnique({
			where: {
				email
			},
		});

		if (existingUser) {
			throw new ConflictException(
				'The email already exists. Please choose a different email.',
			);
		}

		try {
			const hashedPassword = await bcrypt.hash(password, 10);

			const user = await this.usersService.createUser({
				name,
				email,
				password: hashedPassword,
				role: {
					connect: {
						id: 1
					},
				},
			});

			const shoppingCart = await this.prisma.shoppingCart.create({
				data: {
					userId: user.id,
				},
			});

			return {
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
				},
				cartId: shoppingCart.userId,
			};
		} catch (error) {
			if (error instanceof BadRequestException) {
				return {
					message: error.message,
				};
			}

			if (error instanceof ConflictException) {
				return {
					message:
						'The email already exists. Please choose a different email.',
				};
			}

			throw new InternalServerErrorException(
				'An unexpected error occurred. Please try again later.',
			);
		}
	}

	async signIn(
		userSignInDto: UserSignInDto
	): Promise<SignInResponseDto | MessageResponseDto> {
		const {
			email, password
		} = userSignInDto;
		let user = null;
		try {
			user = await this.usersService.user({
				email
			});
		} catch {
			throw new ForbiddenException(
				'Please verify your email before signing in.',
			);
		}

		if (!user || !(await bcrypt.compare(password, user.password))) {
			throw new UnauthorizedException(
				'Invalid user data for token generation.',
			);
		}

		try {
			const expiresAt = new Date();
			expiresAt.setHours(expiresAt.getHours() + 1);

			const payload = {
				user_id: user.id,
				role_id: user.roleId,
				email: user.email,
			};

			const token = this.jwtService.sign(payload, {
				expiresIn: '1h',
			});

			const userToken = await this.prisma.userToken.create({
				data: {
					userId: user.id,
					token,
					expiresAt,
				},
			});

			return {
				accessToken: userToken.token,
			};
		} catch (error) {
			console.error('Error generating reset token:', error);
			throw new InternalServerErrorException(
				'Could not generate the reset token.',
			);
		}
	}

	async forgotPassword(
		forgotPasswordDto: ForgotPasswordDto,
	): Promise<ForgotPasswordResponseDto | MessageResponseDto> {
		const {
			email
		} = forgotPasswordDto;
		let user = null;

		try {
			user = await this.usersService.user({
				email
			});
		} catch {
			throw new ForbiddenException('Please verify your email.');
		}

		if (!user) {
			throw new NotFoundException('User not found');
		}

		try {
			const uuid = uuidv4();
			const expiresAt = new Date();
			expiresAt.setHours(expiresAt.getHours() + 1);

			if (!user.id || !user.roleId || !user.email) {
				throw new InternalServerErrorException(
					'Invalid user data for token generation.',
				);
			}

			const payload = {
				user_id: user.id,
				role_id: user.roleId,
				email: user.email,
				uuid: uuid,
			};

			const resetToken = this.jwtService.sign(payload, {
				expiresIn: '1h',
			});

			await this.prisma.forgotPassword.create({
				data: {
					userId: user.id,
					resetToken,
					expiresAt,
				},
			});

			return {
				resetToken, expiresAt
			};
		} catch (error) {
			console.error('Error during token generation:', error);
			throw new InternalServerErrorException(
				'Could not generate the reset token.',
			);
		}
	}

	async newPassword(
		resetToken: string,
		newPasswordDto: NewPasswordDto,
	): Promise<MessageResponseDto> {
		const {
			newPassword
		} = newPasswordDto;

		try {
			const decodedToken = this.jwtService.verify(resetToken);
			const userId = decodedToken.user_id;

			const tokenRecord = await this.prisma.forgotPassword.findFirst({
				where: {
					resetToken,
					userId,
					expiresAt: {
						gt: new Date(),
					},
				},
			});

			if (!tokenRecord) {
				throw new BadRequestException('Invalid reset token.');
			}

			if (tokenRecord.expiresAt < new Date()) {
				await this.prisma.forgotPassword.delete({
					where: {
						id: tokenRecord.id
					},
				});

				throw new BadRequestException('Expired reset token.');
			}

			const hashedPassword = await bcrypt.hash(newPassword, 10);

			await this.prisma.user.update({
				where: {
					id: userId
				},
				data: {
					password: hashedPassword,
				},
			});

			await this.prisma.forgotPassword.delete({
				where: {
					id: tokenRecord.id
				},
			});

			return {
				message: 'Password successfully reset.'
			};
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}

			throw new InternalServerErrorException(
				'Error processing the password reset request.',
			);
		}
	}

	async resetPassword(
		token: string,
		resetPasswordDto: ResetPasswordDto,
	): Promise<MessageResponseDto> {
		const {
			currentPassword, newPassword
		} = resetPasswordDto;

		try {
			const decodedToken = this.jwtService.verify(token);
			const userId = decodedToken.user_id;
			const user = await this.usersService.user({
				id: userId
			});

			const tokenRecord = await this.prisma.userToken.findFirst({
				where: {
					token,
					userId,
					expiresAt: {
						gt: new Date(),
					},
				},
			});

			if (!tokenRecord) {
				throw new BadRequestException(
					'Invalid or expired reset token.',
				);
			}

			const isCurrentPasswordValid = await bcrypt.compare(
				currentPassword,
				user.password,
			);

			if (!isCurrentPasswordValid) {
				throw new BadRequestException(
					'Invalid request. Ensure that both the current and new passwords are provided.',
				);
			}

			const hashedPassword = await bcrypt.hash(newPassword, 10);

			await this.prisma.user.update({
				where: {
					id: userId
				},
				data: {
					password: hashedPassword,
				},
			});

			return {
				message: 'Password successfully reset.'
			};
		} catch (error) {
			console.error('Error processing reset password request:', error);
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new InternalServerErrorException('Error processing the password reset request.');
		}
	}

	async signOut(token: string): Promise<MessageResponseDto> {
		const tokenRecord = await this.prisma.userToken.findFirst({
			where: {
				token
			},
		});

		if (!tokenRecord) {
			throw new UnauthorizedException('Invalid token.');
		}

		try {
			await this.prisma.userToken.delete({
				where: {
					id: tokenRecord.id
				},
			});

			return {
				message: 'Successfully signed out. Token has been invalidated.',
			};
		} catch (error) {
			console.error('Error during sign out:', error);
			throw new InternalServerErrorException(
				'Could not sign out. Please try again later.',
			);
		}
	}
}
