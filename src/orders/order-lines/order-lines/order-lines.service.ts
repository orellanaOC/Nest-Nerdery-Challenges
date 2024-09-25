import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductsService } from 'src/products/products/products.service';
import { OrderLine } from '../entities/order-line.entity';
import { ShoppingCartLine } from 'src/shopping-cart/shopping-cart-lines/entities/shopping-cart-line.entity';

@Injectable()
export class OrderLinesService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly productsService: ProductsService,
	) {}

	async createOrderLineFromCartLine(
		orderId: number,
		shoppingCartLine: ShoppingCartLine,
	) {
		const { productQuantity, product } = shoppingCartLine;

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

	async getLinesByOrderId(orderId: number): Promise<OrderLine[]> {
		const lines = await this.prisma.orderLine.findMany({
			where: { orderId },
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
					orderId: line.orderId,
					pricePerItem: line.pricePerItem,
					subTotal: line.subTotal,
					createdAt: line.createdAt,
					product: product,
				};
			}),
		);
	}
}
