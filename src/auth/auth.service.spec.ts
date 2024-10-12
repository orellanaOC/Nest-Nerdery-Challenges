import {
	Test, TestingModule
} from '@nestjs/testing';
import {
	AuthService
} from './auth.service';
import {
	PrismaService
} from 'prisma/prisma/prisma.service';
import {
	JwtService
} from '@nestjs/jwt';
import {
	UsersService
} from 'src/users/users/users.service';
import {
	UserSignInDto
} from 'src/users/dto/user-sign-in.dto';
import {
	UserSignUpDto
} from 'src/users/dto/user-sign-up.dto';
import {
	BadRequestException, 
	ConflictException, 
	ForbiddenException, 
	InternalServerErrorException, 
	NotFoundException, 
	UnauthorizedException 
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ForgotPasswordResponseDto } from './dto/forgot-password-response.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const mockPrismaService = {
	userToken: {
		create: jest.fn(),
		findFirst: jest.fn(),
		delete: jest.fn(),
	},
	user: {
		update: jest.fn(),
		findUnique: jest.fn(),
	}, 
	forgotPassword: {
		create: jest.fn(),
		findFirst: jest.fn(),
		delete: jest.fn(),
	},
	shoppingCart: {
		create: jest.fn(),
	},
};

const mockJwtService = {
	sign: jest.fn().mockReturnValue('mockToken'),
	verify: jest.fn(),
};

const mockUsersService = {
	createUser: jest.fn(),
	user: jest.fn(),
};

describe('AuthService', () => {
	let service: AuthService;
	let consoleErrorSpy: jest.SpyInstance;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: PrismaService, useValue: mockPrismaService
				},
				{
					provide: JwtService, useValue: mockJwtService
				},
				{
					provide: UsersService, useValue: mockUsersService
				},
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
		consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
	});
	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('signUp', () => {
		it('should successfully sign up a user', async () => {
			const userSignUpDto: UserSignUpDto = {
				name: 'John Doe',
				email: 'john@example.com',
				password: 'password123*',
			};

			mockPrismaService.user.findUnique.mockResolvedValue(null);
			mockUsersService.createUser.mockResolvedValue({
				id: 1,
				name: userSignUpDto.name,
				email: userSignUpDto.email,
			});
			mockPrismaService.shoppingCart.create.mockResolvedValue({
				userId: 1,
			});

			const result = await service.signUp(userSignUpDto);

			expect(result).toEqual({
				user: {
					id: 1,
					name: 'John Doe',
					email: 'john@example.com',
				},
				cartId: 1,
			});
		});

		it('should throw BadRequestException if required fields are missing', async () => {
			const userSignUpDto: UserSignUpDto = {
				name: '',
				email: '',
				password: '',
			};

			await expect(service.signUp(userSignUpDto)).rejects.toThrow(BadRequestException);
		});

		it('should throw BadRequestException if password is too short', async () => {
			const userSignUpDto: UserSignUpDto = {
				name: 'John Doe',
				email: 'john@example.com',
				password: 'short',
			};

			await expect(service.signUp(userSignUpDto)).rejects.toThrow(BadRequestException);
		})

		it('should throw ConflictException if the email already exists', async() => {
			const userSignUpDto: UserSignUpDto = {
				name: 'John Doe',
				email: 'john@example.com',
				password: 'password123*',
			};

			mockPrismaService.user.findUnique.mockResolvedValue({
				id: 1
			});

			await expect(service.signUp(userSignUpDto)).rejects.toThrow(ConflictException);
		});
	});

	describe('signIn', () => {
		it('should successfully sign in a user and return a token', async() => {
			const userSignInDto: UserSignInDto = {
				email: 'john@example.com',
				password: 'password123*',
			}

			const user = {
				id: 1,
				email: userSignInDto.email,
				password: await bcrypt.hash(userSignInDto.password, 10),
				roleId: 1,
			};

			mockUsersService.user.mockResolvedValue(user);
			mockJwtService.sign.mockReturnValue('mockToken');
			const expiresAt = new Date();
			expiresAt.setHours(expiresAt.getHours() + 1);
	
			mockPrismaService.userToken.create.mockResolvedValue({
				userId: user.id,
				token: 'mockToken',
				expiresAt,
			});

			const result = await service.signIn(userSignInDto);

			expect(result).toEqual({
				accessToken: 'mockToken'
			});
			expect(mockUsersService.user).toHaveBeenCalledWith({
				email: userSignInDto.email
			});
			expect(mockPrismaService.userToken.create).toHaveBeenCalledWith({
				data: {
					userId: user.id,
					token: 'mockToken',
					expiresAt: expect.any(Date),
				},
			});
		});

		it('should throw ForbiddenException if user does not exist', async() => {
			const userSignInDto: UserSignInDto = {
				email: 'john@example.com',
				password: 'password123*',
			}; 

			mockUsersService.user.mockImplementation(() => {
				throw new Error('User not found');
			});

			await expect(service.signIn(userSignInDto)).rejects.toThrow(ForbiddenException);
		});

		it('should throw UnauthorizedException if password is incorrect', async() => {
			const userSignInDto: UserSignInDto = {
				email: 'john@example.com',
				password: 'badPassword123*',
			}; 

			const user = {
				id: 1,
				email: userSignInDto.email,
				password: await bcrypt.hash('correctPassword', 10),
				roleId: 1,
			};

			mockUsersService.user.mockResolvedValue(user);

			await expect(service.signIn(userSignInDto)).rejects.toThrow(UnauthorizedException);
		});

		it('should throw InternalServerErrorException if an error occurs while generating the token', async () => {
			const userSignInDto = {
				email: 'john@example.com',
				password: 'password123',
			};

			const user = {
				id: 1,
				email: userSignInDto.email,
				password: await bcrypt.hash(userSignInDto.password, 10),
				roleId: 1,
			};

			mockUsersService.user.mockResolvedValue(user);
			mockJwtService.sign.mockImplementation(() => {
				throw new Error('Error generating token');
			});

			await expect(service.signIn(userSignInDto)).rejects.toThrow(InternalServerErrorException);
		});
	});

	describe('forgotPassword', () => {
		beforeEach(() => {
			jest.useFakeTimers();
			jest.setSystemTime(new Date('2024-10-10T22:45:36.804Z'));
		});
	
		afterEach(() => {
			jest.useRealTimers();
		});

		jest.mock('bcrypt', () => ({
			hash: jest.fn().mockResolvedValue('hashedpassword'),
			compare: jest.fn(),
		}));

		it('should successfully generate a reset token for a valid user', async() => {
			const forgotPasswordDto: ForgotPasswordDto = { email: 'john@example.com' };

			const user = {
				id: 1,
				email: forgotPasswordDto.email,
				roleId: 1,
			};

			mockUsersService.user.mockResolvedValue(user);
			const resetToken = 'mockResetToken';
			const expiresAt = new Date(Date.now());
			expiresAt.setHours(expiresAt.getHours() + 1); 
			mockJwtService.sign.mockReturnValue(resetToken);
			mockPrismaService.forgotPassword.create.mockResolvedValue({
				userId: user.id,
				resetToken,
				expiresAt,
			});

			const result = await service.forgotPassword(forgotPasswordDto);
			const forgotPasswordResponse = result as ForgotPasswordResponseDto;

			expect(forgotPasswordResponse).toMatchObject({ resetToken });
			expect(forgotPasswordResponse.expiresAt).toEqual(expiresAt);
			expect(mockUsersService.user).toHaveBeenCalledWith({ email: forgotPasswordDto.email });
			expect(mockPrismaService.forgotPassword.create).toHaveBeenCalledWith({
				data: {
					userId: user.id,
					resetToken,
					expiresAt,
				},
			});
		});

		it('should throw ForbiddlenException if the user is not found', async() => {
			const forgotPasswordDto: ForgotPasswordDto = { email: 'badJohn@example.com' };

			mockUsersService.user.mockImplementation(() => {
				throw new Error('User not found');
			});

			await expect(service.forgotPassword(forgotPasswordDto)).rejects.toThrow(ForbiddenException);
		});

		it('should  throw NotFoundException if the user does not exist', async() => {
			const forgotPasswordDto: ForgotPasswordDto = { email: 'badJohn@example.com' };

			mockUsersService.user.mockResolvedValueOnce(null);

			await expect(service.forgotPassword(forgotPasswordDto)).rejects.toThrow(NotFoundException);
		});

		it('should throw InternalServerErrorException if token generation fails', async () => {
			const forgotPasswordDto: ForgotPasswordDto = { email: 'john@example.com' };
			const user = {
				id: 1,
				email: forgotPasswordDto.email,
				roleId: 1,
			};

			mockUsersService.user.mockResolvedValue(user);
			mockJwtService.sign.mockImplementation(() => {
				throw new Error('Error generating token');
			});

			await expect(service.forgotPassword(forgotPasswordDto)).rejects.toThrow(InternalServerErrorException);
		});
	});

	describe('newPassword', () => {
		it('should successfully reset the password', async () => {
			const resetToken = 'valid-token';
			const newPasswordDto = { newPassword: 'newpassword123' };
			const userId = 1;
			const tokenRecord = { id: 1, userId, expiresAt: new Date(Date.now() + 10000) };
	
			mockJwtService.verify.mockReturnValue({ user_id: userId });
			mockPrismaService.forgotPassword.findFirst.mockResolvedValue(tokenRecord);
			mockPrismaService.user.update.mockResolvedValue({});
	
			const result = await service.newPassword(resetToken, newPasswordDto);
	
			expect(result).toEqual({ message: 'Password successfully reset.' });
			expect(mockPrismaService.user.update).toHaveBeenCalledWith({
				where: { id: userId },
				data: { password: expect.any(String) },
			});
			expect(mockPrismaService.forgotPassword.delete).toHaveBeenCalledWith({
				where: { id: tokenRecord.id },
			});
		});
	
		it('should throw BadRequestException for expired token', async () => {
			const resetToken = 'valid-token';
			const newPasswordDto = { newPassword: 'newpassword123' };
			const userId = 1;
			const tokenRecord = { id: 1, userId, expiresAt: new Date(Date.now() - 10000) };
			mockJwtService.verify.mockReturnValue({ user_id: userId });
			mockPrismaService.forgotPassword.findFirst.mockResolvedValue(tokenRecord);
	
			await expect(service.newPassword(resetToken, newPasswordDto)).rejects.toThrow(BadRequestException);
		});
	
		it('should throw BadRequestException for invalid token', async () => {
			const resetToken = 'valid-token';
			const newPasswordDto = { newPassword: 'newpassword123' };
			const userId = 1;
	
			mockJwtService.verify.mockReturnValue({ user_id: userId });
			mockPrismaService.forgotPassword.findFirst.mockResolvedValue(null);
	
			await expect(service.newPassword(resetToken, newPasswordDto)).rejects.toThrow(BadRequestException);
		});
	
		it('should throw InternalServerErrorException on unexpected errors', async () => {
			const resetToken = 'valid-token';
			const newPasswordDto = { newPassword: 'newpassword123' };
			const userId = 1;
	
			mockJwtService.verify.mockReturnValue({ user_id: userId });
			mockPrismaService.forgotPassword.findFirst.mockRejectedValue(new Error('Some error'));
	
			await expect(service.newPassword(resetToken, newPasswordDto)).rejects.toThrow(InternalServerErrorException);
		});
	});

	describe('resetPassword', () => {
		beforeEach(() => {
			jest.useFakeTimers();
			jest.setSystemTime(new Date('2024-10-10T22:45:36.804Z'));
		});
		
		afterEach(() => {
			jest.useRealTimers();
		});
		
		jest.mock('bcrypt', () => ({
			hash: jest.fn().mockResolvedValue('hashedPassword'),
			compare: jest.fn().mockResolvedValue(true),
		}));
		
		it('should successfully reset the password', async () => {
			const token = 'valid-token';
			const resetPasswordDto: ResetPasswordDto = {
				currentPassword: 'currentPassword123',
				newPassword: 'newPassword123',
			};
		
			const userId = 1;
			const user = {
				id: userId,
				password: await bcrypt.hash('currentPassword123', 10),
			};
		
			mockJwtService.verify.mockReturnValue({ user_id: userId });
			mockUsersService.user.mockResolvedValue(user);
			mockPrismaService.userToken.findFirst.mockResolvedValue({
				userId,
				token,
				expiresAt: new Date(Date.now() + 10000),
			});
		
			const result = await service.resetPassword(token, resetPasswordDto);
		
			expect(result).toEqual({ message: 'Password successfully reset.' });
			expect(mockPrismaService.user.update).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { id: userId },
					data: { password: expect.any(String) },
				})
			);
		});
		
		it('should throw BadRequestException for invalid token', async () => {
			const token = 'invalid-token';
			const resetPasswordDto: ResetPasswordDto = {
				currentPassword: 'currentPassword123',
				newPassword: 'newPassword123',
			};
		
			mockJwtService.verify.mockReturnValue({ user_id: 1 });
			mockPrismaService.userToken.findFirst.mockResolvedValue(null); // No token record found
		
			await expect(service.resetPassword(token, resetPasswordDto)).rejects.toThrow(
				BadRequestException,
			);
		});
		
		it('should throw BadRequestException for invalid current password', async () => {
			const token = 'valid-token';
			const resetPasswordDto: ResetPasswordDto = {
				currentPassword: 'wrongCurrentPassword',
				newPassword: 'newPassword123',
			};
		
			const userId = 1;
			const user = {
				id: userId,
				password: await bcrypt.hash('currentPassword123', 10),
			};
		
			mockJwtService.verify.mockReturnValue({ user_id: userId });
			mockUsersService.user.mockResolvedValue(user);
			mockPrismaService.userToken.findFirst.mockResolvedValue({
				userId,
				token,
				expiresAt: new Date(Date.now() + 10000),
			});
		
			await expect(service.resetPassword(token, resetPasswordDto)).rejects.toThrow(
				BadRequestException,
			);
		});
		
		it('should throw InternalServerErrorException on unexpected errors', async () => {
			const token = 'valid-token';
			const resetPasswordDto: ResetPasswordDto = {
				currentPassword: 'currentPassword123',
				newPassword: 'newPassword123',
			};
			
			const userId = 1;
			const user = {
				id: userId,
				password: await bcrypt.hash('currentPassword123', 10),
			};
			
			mockJwtService.verify.mockReturnValue({ user_id: userId });
			mockUsersService.user.mockResolvedValue(user);
			
			mockPrismaService.userToken.findFirst.mockRejectedValue(new Error('Unexpected error'));
		
			await expect(service.resetPassword(token, resetPasswordDto)).rejects.toThrow(InternalServerErrorException);
		});
	});

	describe('signOut', () => {
		it('should successfully sign out a user and invalidate the token', async () => {
			const token = 'valid-token';
			const tokenRecord = { id: 1 };

			mockPrismaService.userToken.findFirst.mockResolvedValue(tokenRecord);
			mockPrismaService.userToken.delete.mockResolvedValue({});

			const result = await service.signOut(token);

			expect(result).toEqual({ message: 'Successfully signed out. Token has been invalidated.' });
			expect(mockPrismaService.userToken.findFirst).toHaveBeenCalledWith({ where: { token } });
			expect(mockPrismaService.userToken.delete).toHaveBeenCalledWith({ where: { id: tokenRecord.id } });
		});

		it('should throw UnauthorizedException if the token is invalid', async () => {
			const token = 'invalid-token';

			mockPrismaService.userToken.findFirst.mockResolvedValue(null);

			await expect(service.signOut(token)).rejects.toThrow(UnauthorizedException);
		});

		it('should throw InternalServerErrorException on unexpected errors', async () => {
			const token = 'valid-token';
			const tokenRecord = { id: 1 };

			mockPrismaService.userToken.findFirst.mockResolvedValue(tokenRecord);
			mockPrismaService.userToken.delete.mockRejectedValue(new Error('Unexpected error'));

			await expect(service.signOut(token)).rejects.toThrow(InternalServerErrorException);
		});
	});
});
