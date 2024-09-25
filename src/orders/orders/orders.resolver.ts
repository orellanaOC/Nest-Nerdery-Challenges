import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Order } from '../entities/order.entity';
import { OrdersService } from './orders.service';
import { OrderStatus } from '@prisma/client';

@Resolver(() => Order)
export class OrdersResolver {
	constructor(private readonly ordersService: OrdersService) {}

	// TODO: add pagination to the query of orders and myOrders

	@Query(() => Order)
	async order(@Args('id', { type: () => Int }) id: number): Promise<Order> {
		return this.ordersService.findOrderById(id);
	}

	// TODO: add the userId by header
	@Query(() => [Order])
	async myOrders(
		// prettier-ignore
		@Args('status', { type: () => OrderStatus, nullable: true }) status: OrderStatus,
	): Promise<Order[]> {
		const userId = 1;

		return this.ordersService.orders(userId, status);
	}

	@Query(() => [Order])
	async orders(
		// prettier-ignore
		@Args('status', { type: () => OrderStatus, nullable: true }) status: OrderStatus,
		@Args('userId', { type: () => Int, nullable: true }) userId: number,
	): Promise<Order[]> {
		return this.ordersService.orders(userId, status);
	}

	@Mutation(() => Order)
	// TODO: add the userId by header
	/*@Args('userId') userId: number*/
	async checkouts(): Promise<Order> {
		const userId = 1;
		return this.ordersService.createOrderFromCart(userId);
	}
}
