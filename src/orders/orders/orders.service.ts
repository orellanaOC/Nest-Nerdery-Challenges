import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderLinesService } from '../order-lines/order-lines/order-lines.service';
import { ShoppingCartsService } from 'src/shopping-cart/shopping-cart/shopping-cart.service';
import { Order } from '../entities/order.entity';
import { Prisma } from '@prisma/client';
import { OrderFilter } from '../dto/order-filter-input.dto';
import { OrderConnection } from '../dto/order-connection.entity';
import { PaginationService } from 'src/pagination/pagination/pagination.service';

@Injectable()
export class OrdersService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly orderLineService: OrderLinesService,
		private readonly shoppingCartService: ShoppingCartsService,
		private readonly paginationService: PaginationService,
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

	async findOrderById(id: number): Promise<Order> {
		const order = await this.prisma.order.findUnique({
			where: { id },
			include: {
				lines: true,
			},
		});

		if (!order) {
			throw new NotFoundException(
				'Shopping cart not found for this user',
			);
		}

		const lines = await this.orderLineService.getLinesByOrderId(id);

		return {
			id,
			userId: order.userId,
			status: order.status,
			total: order.total,
			createdAt: order.createdAt,
			updatedAt: order.updatedAt,
			lines: lines,
		};
	}

	async orders(filter?: OrderFilter): Promise<OrderConnection> {
		const { status, pagination, userId } = filter || {};
		// prettier-ignore
		const whereClause: Prisma.OrderWhereInput | undefined =
			userId || status
				? {
					userId: userId || undefined,
					status: status || undefined,
				}
				: undefined;

		return this.paginationService.paginate<Order, Prisma.OrderFindManyArgs>(
			this.prisma.order.findMany.bind(this.prisma.order),
			pagination,
			'id',
			whereClause,
			{ createdAt: 'asc' } as Prisma.OrderOrderByWithRelationInput,
			{
				lines: {
					include: {
						product: {
							include: {
								picture: true,
								category: true,
							},
						},
					},
				},
			},
		);
	}
}
