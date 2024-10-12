import {
	Test, TestingModule
} from '@nestjs/testing';
import {
	UsersService
} from './users.service';
import { PrismaService } from 'prisma/prisma/prisma.service';

const mockPrismaService = {
	user: {
		findUnique: jest.fn(),
		create: jest.fn(),
	},
};

describe('UsersService', () => {
	let service: UsersService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,
				{ provide: PrismaService, useValue: mockPrismaService },
			],
		}).compile();

		service = module.get<UsersService>(UsersService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
