import {
	BadRequestException,
	ConflictException,
	forwardRef,
	Inject,
	Injectable,
	InternalServerErrorException,
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

	async signIn(userSignInDto: UserSignInDto) {
		const { email, password } = userSignInDto;
		const user = await this.prisma.user.findUnique({
			where: { email },
		});

		if (!user || !(await bcrypt.compare(password, user.password))) {
			throw new UnauthorizedException('Invalid credentials.');
		}

		const payload = { sub: user.id, email: user.email };
		const token = this.jwtService.sign(payload);

		return {
			accessToken: token,
		};
	}
}
