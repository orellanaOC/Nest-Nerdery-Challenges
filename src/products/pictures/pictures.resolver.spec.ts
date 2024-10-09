import { Test, TestingModule } from '@nestjs/testing';
import { PicturesResolver } from './pictures.resolver';
import { PicturesService } from './pictures.service';
import { PrismaService } from 'prisma/prisma/prisma.service';

const mockPicturesService = {
	create: jest.fn(),
	findAllByProductId: jest.fn(),
};

describe('PicturesResolver', () => {
	let resolver: PicturesResolver;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PicturesResolver,
				{ provide: PicturesService, useValue: mockPicturesService },
				PrismaService,
			],
		}).compile();

		resolver = module.get<PicturesResolver>(PicturesResolver);
	});

	it('should be defined', () => {
		expect(resolver).toBeDefined();
	});
});
