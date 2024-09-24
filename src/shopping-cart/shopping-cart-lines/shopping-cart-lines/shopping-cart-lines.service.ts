import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PicturesService } from 'src/products/pictures/pictures.service';
import { ShoppingCartLine } from '../entities/shopping-cart-line.entity';

@Injectable()
export class ShoppingCartLinesService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly picturesService: PicturesService,
	) {}

	async getLinesByCartId(
		shoppingCartId: number,
	): Promise<ShoppingCartLine[]> {
		const lines = await this.prisma.shoppingCartLine.findMany({
			where: { shoppingCartId },
			include: {
				product: {
					include: {
						category: true,
						picture: true,
					},
				},
			},
		});

		return Promise.all(
			lines.map(async (line) => {
				const pictures = await this.picturesService.findAllByProductId(
					line.product.id,
				);

				return {
					id: line.id,
					productQuantity: line.productQuantity,
					shoppingCartId: line.shoppingCartId,
					createdAt: line.createdAt,
					updatedAt: line.updatedAt,
					product: {
						id: line.product.id,
						enable: line.product.enable,
						name: line.product.name,
						price: line.product.price,
						stock: line.product.stock,
						specification: line.product.specification,
						createdAt: line.product.createdAt,
						updatedAt: line.product.updatedAt,
						category: {
							id: line.product.category.id,
							name: line.product.category.name,
						},
						picture: pictures.map((picture) => ({
							id: picture.id,
							productId: picture.productId,
							imageUrl: picture.imageUrl,
							createdAt: picture.createdAt,
						})),
					},
				};
			}),
		);
	}
}
