import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Order } from '../entities/order.entity';
import { OrdersService } from './orders.service';

@Resolver(() => Order)
export class OrdersResolver {
	constructor(private readonly ordersService: OrdersService) {}

	@Mutation(() => Order)
	// TODO: add the userId by header
	async checkouts(/*@Args('userId') userId: number*/): Promise<Order> {
		const userId = 1;
		return this.ordersService.createOrderFromCart(userId);
	}
}
