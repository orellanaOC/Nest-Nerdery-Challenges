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
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma/prisma.service';
import { UserSignUpDto } from '../users/dto/user-sign-up.dto';
import { UserSignInDto } from '../users/dto/user-sign-in.dto';
import { SignUpResponseDto } from './dto/sign-up-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { UsersService } from 'src/users/users/users.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { v4 as uuidv4 } from 'uuid';
import { SignInResponseDto } from './dto/sign-in-response.dto';
import { ForgotPasswordResponseDto } from './dto/forgot-password-response.dto';

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
		const { name, email, password } = userSignUpDto;

		try {
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
				where: { email },
			});

			if (existingUser) {
				throw new ConflictException(
					'The email already exists. Please choose a different email.',
				);
			}

			const hashedPassword = await bcrypt.hash(password, 10);

			const user = await this.usersService.createUser({
				name,
				email,
				password: hashedPassword,
				role: {
					connect: { id: 1 },
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
		userSignInDto: UserSignInDto,
	): Promise<SignInResponseDto | MessageResponseDto> {
		const { email, password } = userSignInDto;
		let user = null;
		try {
			user = await this.usersService.user({ email });
		} catch {
			throw new ForbiddenException(
				'Please verify your email before signing in.',
			);
		}

		if (!user || !(await bcrypt.compare(password, user.password))) {
			throw new UnauthorizedException('Invalid credentials.');
		}

		try {
			const payload = {
				user_id: user.id,
				role: user.roleId,
				email: user.email,
			};
			const token = this.jwtService.sign(payload, {
				expiresIn: '1h',
			});

			return {
				accessToken: token,
			};
		} catch {
			throw new InternalServerErrorException(
				'Could not generate authentication token.',
			);
		}
	}

	async forgotPassword(
		forgotPasswordDto: ForgotPasswordDto,
	): Promise<ForgotPasswordResponseDto | MessageResponseDto> {
		const { email } = forgotPasswordDto;
		let user = null;

		try {
			user = await this.usersService.user({ email });
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
			const payload = {
				user_id: user.id,
				role: user.roleId,
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

			return { resetToken, expiresAt };
		} catch {
			throw new InternalServerErrorException(
				'Could not generate the reset token.',
			);
		}
	}
}
