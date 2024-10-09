import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'prisma/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users/users.service';

const mockPrismaService = {
	user: {
		findUnique: jest.fn(),
	},
	shoppingCart: {
		create: jest.fn(),
	},
};

const mockJwtService = {
	sign: jest.fn(),
	verify: jest.fn(),
};

const mockUsersService = {
	createUser: jest.fn(),
	user: jest.fn(),
};

describe('AuthService', () => {
	let service: AuthService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{ provide: PrismaService, useValue: mockPrismaService },
				{ provide: JwtService, useValue: mockJwtService },
				{ provide: UsersService, useValue: mockUsersService },
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
