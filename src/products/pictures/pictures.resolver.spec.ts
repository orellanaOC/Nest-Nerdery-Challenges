import { Test, TestingModule } from '@nestjs/testing';
import { PicturesResolver } from './pictures.resolver';

describe('PicturesResolver', () => {
	let resolver: PicturesResolver;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [PicturesResolver],
		}).compile();

		resolver = module.get<PicturesResolver>(PicturesResolver);
	});

	it('should be defined', () => {
		expect(resolver).toBeDefined();
	});
});
