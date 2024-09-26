import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderLinesService } from '../order-lines/order-lines/order-lines.service';
import { ShoppingCartsService } from 'src/shopping-cart/shopping-cart/shopping-cart.service';
import { Order } from '../entities/order.entity';
import { Prisma } from '@prisma/client';
import { OrderFilter } from '../dto/order-filter-input.dto';
import { OrderConnection } from '../dto/order-connection.entity';
import { PageInfoModel } from 'src/pagination/entities/page-info.entity';

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
		const { first, after, last, before } = pagination || {};

		// Building Prisma Filters
		const whereClause: Prisma.OrderWhereInput = {
			userId,
			status: status || undefined,
		};

		// Convert Cursors to Prisma Cursors
		let cursor = after ? { id: Number(after) } : undefined;

		// If you are paging backwards (with 'before'), the cursor changes
		if (before) {
			cursor = { id: Number(before) };
		}

		// Define the amount of elements to take
		let take = first || last || 10;
		if (last) {
			take = -take;
		}

		const skip = cursor ? 1 : 0;

		// Get filtered and paginated orders
		const orders = await this.prisma.order.findMany({
			where: whereClause,
			orderBy: {
				id: 'asc',
			},
			take,
			skip,
			cursor,
			include: {
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
		});

		// Calculate cursors for pagination
		const startCursor = orders.length > 0 ? orders[0].id.toString() : null;
		const endCursor =
			orders.length > 0 ? orders[orders.length - 1].id.toString() : null;

		// Calculate if there are more pages
		const hasNextPage = !!(await this.prisma.order.findFirst({
			where: whereClause,
			cursor: { id: Number(endCursor) },
			skip: 1,
			orderBy: { id: 'asc' },
		}));

		const hasPreviousPage = !!(await this.prisma.order.findFirst({
			where: whereClause,
			cursor: { id: Number(startCursor) },
			skip: 1,
			orderBy: { id: 'desc' }, // To search backwards
		}));

		const pageInfo: PageInfoModel = {
			startCursor,
			endCursor,
			hasNextPage,
			hasPreviousPage,
		};

		const edges = orders.map((order) => ({
			cursor: order.id.toString(),
			node: order,
		}));

		return {
			edges,
			pageInfo,
		};
	}
}
