import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Order } from '../entities/order.entity';
import { OrdersService } from './orders.service';

@Resolver(() => Order)
export class OrdersResolver {
	constructor(private readonly ordersService: OrdersService) {}

	// TODO: add pagination to the query of orders and myOrders

	@Query(() => Order)
	async order(@Args('id', { type: () => Int }) id: number): Promise<Order> {
		return this.ordersService.findOrderById(id);
	}

	@Mutation(() => Order)
	// TODO: add the userId by header
	async checkouts(/*@Args('userId') userId: number*/): Promise<Order> {
		const userId = 1;
		return this.ordersService.createOrderFromCart(userId);
	}
}
