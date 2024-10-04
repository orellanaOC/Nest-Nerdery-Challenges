import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma/prisma.service';
import { ShoppingCartLine } from '../entities/shopping-cart-line.entity';
import { ShoppingCartLineInput } from '../dto/shopping-cart-line-input.dto';
import { ProductsService } from 'src/products/products/products.service';

@Injectable()
export class ShoppingCartLinesService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly productsService: ProductsService,
	) {}

	async updateShoppingCartLines(
		userId: number,
		shoppingCartLineInput: ShoppingCartLineInput,
	): Promise<ShoppingCartLine[]> {
		const lines = await this.getLinesByCartId(userId);

		const existingLine = lines.find(
			(line) => line.product.id === shoppingCartLineInput.product.id,
		);

		const productQuantity = shoppingCartLineInput.productQuantity;

		if (productQuantity === 0) {
			// Delete line if product already exists and quantity is 0
			if (existingLine) {
				await this.prisma.shoppingCartLine.delete({
					where: { id: existingLine.id },
				});
			}
		} else {
			// Update the quantity of the line if the product already exists
			if (existingLine) {
				await this.prisma.shoppingCartLine.update({
					where: { id: existingLine.id },
					data: { productQuantity },
				});
			} else {
				// Add a new line if the product doesn't exist in the cart
				await this.prisma.shoppingCartLine.create({
					data: {
						productQuantity,
						shoppingCartId: userId,
						productId: shoppingCartLineInput.product.id,
					},
				});
			}
		}

		return this.getLinesByCartId(userId);
	}

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
				const product = await this.productsService.findOne(
					line.product.id,
				);

				return {
					id: line.id,
					productQuantity: line.productQuantity,
					shoppingCartId: line.shoppingCartId,
					createdAt: line.createdAt,
					updatedAt: line.updatedAt,
					product: product,
				};
			}),
		);
	}
}
