import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ShoppingCartLinesService } from '../shopping-cart-lines/shopping-cart-lines/shopping-cart-lines.service';
import { ShoppingCart } from '../entities/shopping-cart.entity';

@Injectable()
export class ShoppingCartsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly shoppingCartLinesService: ShoppingCartLinesService,
	) {}

	async getShoppingCartByUserId(userId: number): Promise<ShoppingCart> {
		const cart = await this.prisma.shoppingCart.findUnique({
			where: {
				userId: userId,
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
			id: cart.userId,
			totalAmount: cart.total,
			lines: lines,
		};
	}
}
