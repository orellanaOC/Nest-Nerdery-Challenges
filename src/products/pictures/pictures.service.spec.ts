import {
	Test, TestingModule
} from '@nestjs/testing';
import {
	PicturesService
} from './pictures.service';
import {
	PrismaService
} from 'prisma/prisma/prisma.service';
import {
	CreatePictureDto
} from './dto/create-picture.dto';
import { BadRequestException } from '@nestjs/common';

const mockPrismaService = {
	picture: {
		create: jest.fn(),
		findMany: jest.fn(),
	},
};

describe('PicturesService', () => {
	let service: PicturesService;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PicturesService,
				{
					provide: PrismaService, useValue: mockPrismaService
				},
			],
		}).compile();

		service = module.get<PicturesService>(PicturesService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('create', () => {
		it('should create a picture and return it', async () => {
			const createPictureDto: CreatePictureDto = {
				productId: 1,
				imageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDA',
			};
	
			const result = {
				id: 1,
				productId: createPictureDto.productId,
				imageUrl: expect.any(String),
			};
	
			mockPrismaService.picture.create.mockResolvedValue(result);

			jest.spyOn(service as any, 'validateBase64Image').mockReturnValue(true);
	
			const response = await service.create(createPictureDto);
	
			expect(response).toEqual(result);
			expect(mockPrismaService.picture.create).toHaveBeenCalledWith({
				data: {
					productId: createPictureDto.productId,
					imageUrl: expect.any(String),
				},
			});
	
			jest.restoreAllMocks();
		});

		it('should throw an error if imageBase64 is not valid', async () => {
			const createPictureDto: CreatePictureDto = {
				productId: 1,
				imageBase64: '',
			};

			await expect(service.create(createPictureDto)).rejects.toThrow(BadRequestException);
		});
	});

	describe('findAllByProductId', () => {
		it('should return an array of pictures', async () => {
			const productId = 1;
			const pictures = [
				{
					id: 1, productId, imageUrl: 'image1.jpg' 
				},
				{
					id: 2, productId, imageUrl: 'image2.jpg' 
				},
			];

			mockPrismaService.picture.findMany.mockResolvedValue(pictures);

			const result = await service.findAllByProductId(productId);

			expect(result).toEqual(pictures);
			expect(mockPrismaService.picture.findMany).toHaveBeenCalledWith({
				where: {
					productId
				},
			});
		});
	});
});
