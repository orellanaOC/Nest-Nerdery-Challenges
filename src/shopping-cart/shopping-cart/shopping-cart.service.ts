import {
	Injectable, NotFoundException
} from '@nestjs/common';
import {
	PrismaService
} from 'prisma/prisma/prisma.service';
import {
	ShoppingCartLinesService
} from '../shopping-cart-lines/shopping-cart-lines/shopping-cart-lines.service';
import {
	ShoppingCart
} from '../entities/shopping-cart.entity';
import {
	ShoppingCartLineInput
} from '../shopping-cart-lines/dto/shopping-cart-line-input.dto';

@Injectable()
export class ShoppingCartsService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly shoppingCartLinesService: ShoppingCartLinesService,
	) {}

	async getShoppingCartByUserId(userId: number): Promise<ShoppingCart> {
		const cart = await this.prismaService.shoppingCart.findUnique({
			where: {
				userId
			},
			include: {
				lines: true,
			},
		});

		if (!cart) {
			throw new NotFoundException(
				'Shopping cart not found for this user',
			);
		}

		const lines = await this.shoppingCartLinesService.getLinesByCartId(
			cart.userId,
		);

		return {
			userId: cart.userId,
			totalAmount: cart.total,
			lines: lines,
		};
	}

	async updateShoppingCart(
		userId: number,
		shoppingCartLineInput: ShoppingCartLineInput,
	): Promise<ShoppingCart> {
		const cart = await this.prismaService.shoppingCart.findUnique({
			where: {
				userId
			},
		});

		if (!cart) {
			throw new NotFoundException(
				'Shopping cart not found for this user',
			);
		}

		const updatedLines =
			await this.shoppingCartLinesService.updateShoppingCartLines(
				userId,
				shoppingCartLineInput,
			);

		// Recalculate the total amount based on the updated lines
		const totalAmount = updatedLines.reduce((total, line) => {
			return total + line.product.price * line.productQuantity;
		}, 0);

		// Update the shopping cart total amount
		await this.prismaService.shoppingCart.update({
			where: {
				userId: cart.userId
			},
			data: {
				total: totalAmount
			},
		});

		return {
			userId: cart.userId,
			totalAmount,
			lines: updatedLines,
		};
	}

	async clearShoppingCart(userId: number) {
		await this.prismaService.shoppingCartLine.deleteMany({
			where: {
				shoppingCartId: userId
			},
		});
	}
}
