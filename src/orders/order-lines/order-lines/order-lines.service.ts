import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ShoppingCartLine } from 'src/shopping-cart/shopping-cart-lines/entities/shopping-cart-line.entity';

@Injectable()
export class OrderLinesService {
	constructor(private readonly prisma: PrismaService) {}

	async createOrderLineFromCartLine(
		orderId: number,
		cartLine: ShoppingCartLine,
	) {
		const { productQuantity, product } = cartLine;

		return this.prisma.orderLine.create({
			data: {
				orderId,
				productId: product.id,
				productQuantity,
				pricePerItem: product.price,
				subTotal: product.price * productQuantity,
			},
		});
	}
}
