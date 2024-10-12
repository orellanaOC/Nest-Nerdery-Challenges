import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import {
	PrismaService
} from 'prisma/prisma/prisma.service';
import {
	OrderLinesService
} from '../order-lines/order-lines/order-lines.service';
import {
	ShoppingCartsService
} from 'src/shopping-cart/shopping-cart/shopping-cart.service';
import {
	Order
} from '../entities/order.entity';
import {
	OrderStatus, Prisma
} from '@prisma/client';
import {
	OrderFilter
} from '../dto/order-filter-input.dto';
import {
	OrderConnection
} from '../dto/order-connection.entity';
import {
	PaginationService
} from 'src/pagination/pagination/pagination.service';
import {
	PaymentsService
} from 'src/payments/payments.service';
import {
	OrderResponse
} from '../dto/order-response.dto';

@Injectable()
export class OrdersService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly orderLineService: OrderLinesService,
		private readonly shoppingCartService: ShoppingCartsService,
		private readonly paginationService: PaginationService,
		private readonly paymentsService: PaymentsService
	) {}

	async createOrderFromCart(userId: number): Promise<OrderResponse> {
		const shoppingCart =
			await this.shoppingCartService.getShoppingCartByUserId(userId);

		if (!shoppingCart || shoppingCart.lines.length === 0) {
			throw new Error('Shopping cart is empty');
		}

		const totalAmount = shoppingCart.lines.reduce((total, line) => {
			return total + line.product.price * line.productQuantity;
		}, 0);

		const paymentIntent = await this.paymentsService.createPaymentIntent(
			totalAmount,
			'usd'
		);

		const newOrder = await this.prisma.order.create({
			data: {
				userId,
				total: totalAmount,
				paymentIntentId: paymentIntent.id,
			},
		});

		await Promise.all(
			shoppingCart.lines.map((line) =>
				this.orderLineService.createOrderLineFromCartLine(
					newOrder.id,
					line
				)
			)
		);

		const orderWithLines = await this.prisma.order.findUnique({
			where: {
				id: newOrder.id
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

		return orderWithLines;
	}

	async orderStatusChange(
		paymentIntentId: string,
		successful: boolean
	): Promise<OrderResponse> {
		const order = await this.findOneByPaymentIntentId(paymentIntentId);

		if (!order) {
			throw new NotFoundException(
				`Order not found for PaymentIntent ID: ${paymentIntentId}`
			);
		}

		if (successful) {
			await this.shoppingCartService.clearShoppingCart(order.userId);
		}

		return await this.prisma.order.update({
			where: {
				id: order.id
			},
			data: {
				status: successful ? OrderStatus.SUCCEEDED : OrderStatus.FAILED,
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
	}

	async findOneByPaymentIntentId(
		paymentIntentId: string
	): Promise<Order | undefined> {
		const order = await this.prisma.order.findUnique({
			where: {
				paymentIntentId
			},
			include: {
				lines: true,
			},
		});

		if (!order) {
			throw new NotFoundException('Order not found');
		}

		const lines = await this.orderLineService.getLinesByOrderId(order.id);

		return {
			id: order.id,
			userId: order.userId,
			status: order.status,
			total: order.total,
			paymentIntentId: order.paymentIntentId,
			createdAt: order.createdAt,
			updatedAt: order.updatedAt,
			lines: lines,
		};
	}

	async findOrderById(
		id: number,
		userId?: number,
		roleId?: number
	): Promise<OrderResponse> {
		const order = await this.prisma.order.findUnique({
			where: {
				id
			},
			include: {
				lines: true,
			},
		});

		if (!order) {
			throw new NotFoundException('Order not found');
		}

		if (roleId !== 2 && order.userId !== userId) {
			throw new UnauthorizedException(
				'You do not have access to this order'
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

	async orders(
		filter?: OrderFilter,
		userIdLogged?: number
	): Promise<OrderConnection> {
		let {
			// eslint-disable-next-line prefer-const
			status, pagination, userId 
		} = filter || {};

		if (userIdLogged) {
			userId = userIdLogged;
		}

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
			{
				createdAt: 'asc'
			} as Prisma.OrderOrderByWithRelationInput,
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
			}
		);
	}
}
