import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ShoppingCartLinesService } from '../shopping-cart-lines/shopping-cart-lines/shopping-cart-lines.service';
import { ShoppingCart } from '../entities/shopping-cart.entity';
import { PicturesService } from 'src/products/pictures/pictures.service';

@Injectable()
export class ShoppingCartsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly shoppingCartLinesService: ShoppingCartLinesService,
		private readonly picturesService: PicturesService,
	) {}

	async getShoppingCartByUserId(userId: number): Promise<ShoppingCart> {
		const cart = await this.prisma.shoppingCart.findUnique({
			where: {
				userId: userId,
			},
			include: {
				lines: {
					include: {
						product: {
							include: {
								category: true,
								picture: true,
							},
						},
					},
				},
			},
		});

		if (!cart) {
			throw new NotFoundException(
				'Shopping cart not found for this user',
			);
		}

		const lines = await Promise.all(
			cart.lines.map(async (line) => {
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

		return {
			id: cart.userId,
			totalAmount: cart.total,
			lines: lines,
		};
	}
}
