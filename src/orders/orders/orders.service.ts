import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderLinesService } from '../order-lines/order-lines/order-lines.service';
import { ShoppingCartsService } from 'src/shopping-cart/shopping-cart/shopping-cart.service';
import { Order } from '../entities/order.entity';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly orderLineService: OrderLinesService,
		private readonly shoppingCartService: ShoppingCartsService,
	) {}

	async createOrderFromCart(userId: number): Promise<Order> {
		const shoppingCart =
			await this.shoppingCartService.getShoppingCartByUserId(userId);

		if (!shoppingCart || shoppingCart.lines.length === 0) {
			throw new Error('Shopping cart is empty');
		}

		const totalAmount = shoppingCart.lines.reduce((total, line) => {
			return total + line.product.price * line.productQuantity;
		}, 0);

		const newOrder = await this.prisma.order.create({
			data: {
				userId,
				total: totalAmount,
			},
		});

		await Promise.all(
			shoppingCart.lines.map((line) =>
				this.orderLineService.createOrderLineFromCartLine(
					newOrder.id,
					line,
				),
			),
		);

		const orderWithLines = await this.prisma.order.findUnique({
			where: { id: newOrder.id },
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

		// TODO: delete the shopping cart after the succeeded paid order
		//await this.shoppingCartService.clearCart(userId);

		return orderWithLines;
	}
}
