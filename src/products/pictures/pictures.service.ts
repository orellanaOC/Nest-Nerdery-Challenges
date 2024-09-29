import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma/prisma.service';
import { CreatePictureDto } from './dto/create-picture.dto';

@Injectable()
export class PicturesService {
	constructor(private readonly prisma: PrismaService) {}

	async create(data: CreatePictureDto) {
		return this.prisma.picture.create({
			data,
		});
	}

	async findAllByProductId(productId: number) {
		return this.prisma.picture.findMany({
			where: { productId },
		});
	}
}
