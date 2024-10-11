import {
	Injectable
} from '@nestjs/common';
import {
	PrismaService
} from 'prisma/prisma/prisma.service';
import {
	CreatePictureDto
} from './dto/create-picture.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PicturesService {
	constructor(private readonly prisma: PrismaService) {}

	async create(data: CreatePictureDto) {
		const fileName = `${Date.now()}-${data.productId}.jpg`;
		const uploadDir = path.join(__dirname, '..', '..', 'uploads');
		const filePath = path.join(__dirname, '..', '..', 'uploads', fileName);

		await fs.promises.mkdir(uploadDir, {
			recursive: true
		});

		const base64Data = data.imageBase64.replace(
			/^data:image\/\w+;base64,/,
			''
		);
		const buffer = Buffer.from(base64Data, 'base64');

		await fs.promises.writeFile(filePath, buffer);

		return this.prisma.picture.create({
			data: {
				productId: data.productId,
				imageUrl: fileName,
			},
		});
	}

	async findAllByProductId(productId: number) {
		return this.prisma.picture.findMany({
			where: {
				productId
			},
		});
	}
}
