import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Order } from '../entities/order.entity';
import { OrdersService } from './orders.service';
import { OrderFilter } from '../dto/order-filter-input.dto';
import { OrderConnection } from '../dto/order-connection.entity';

@Resolver(() => Order)
export class OrdersResolver {
	constructor(private readonly ordersService: OrdersService) {}

	@Query(() => Order)
	async order(
		// prettier-ignore
		@Args('id', { type: () => Int }) id: number,
	): Promise<Order> {
		return this.ordersService.findOrderById(id);
	}

	// TODO: add the userId by header
	@Query(() => OrderConnection)
	async myOrders(
		// prettier-ignore
		@Args('filter', { type: () => OrderFilter, nullable: true }) filter: OrderFilter,
	): Promise<OrderConnection> {
		const userId = 1;

		return this.ordersService.orders(filter); // TODO: userId by header
	}

	@Query(() => OrderConnection)
	async orders(
		// prettier-ignore
		@Args('filter', { type: () => OrderFilter, nullable: true }) filter: OrderFilter,
	): Promise<OrderConnection> {
		return this.ordersService.orders(filter);
	}

	@Mutation(() => Order)
	// TODO: add the userId by header
	/*@Args('userId') userId: number*/
	async checkouts(): Promise<Order> {
		const userId = 1;
		return this.ordersService.createOrderFromCart(userId);
	}
}
