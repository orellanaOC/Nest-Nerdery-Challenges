import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Order } from '../entities/order.entity';
import { OrdersService } from './orders.service';
import { OrderFilter } from '../dto/order-filter-input.dto';
import { OrderConnection } from '../dto/order-connection.entity';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { OrderResponse } from '../dto/order-response.dto';

@Resolver(() => Order)
export class OrdersResolver {
	constructor(private readonly ordersService: OrdersService) {}

	@Query(() => Order, {
		description:
			'Order by Id. Requires authentication with Manager role or the logged user id.',
	})
	@UseGuards(GqlAuthGuard)
	async order(
		// prettier-ignore
		@Args('id', { type: () => Int }) id: number,
		@Context() context: any,
	): Promise<OrderResponse> {
		const { user } = context.req;
		return this.ordersService.findOrderById(id, user.userId, user.roleId);
	}

	@Query(() => OrderConnection, {
		description: 'My Orders. Requires authentication.',
	})
	@UseGuards(GqlAuthGuard)
	async myOrders(
		// prettier-ignore
		@Args('filter', { type: () => OrderFilter, nullable: true }) filter: OrderFilter,
		@Context() context: any,
	): Promise<OrderConnection> {
		try {
			const { user } = context.req;

			return this.ordersService.orders(filter, user.userId);
		} catch {
			throw new BadRequestException('Invalid token');
		}
	}

	@Query(() => OrderConnection, {
		description: 'Orders. Requires authentication with Manager role.',
	})
	@Roles(2)
	@UseGuards(GqlAuthGuard, RolesGuard)
	async orders(
		// prettier-ignore
		@Args('filter', { type: () => OrderFilter, nullable: true }) filter: OrderFilter,
	): Promise<OrderConnection> {
		return this.ordersService.orders(filter);
	}

	@Mutation(() => Order)
	@UseGuards(GqlAuthGuard)
	async checkouts(@Context() context: any): Promise<OrderResponse> {
		try {
			const { user } = context.req;

			return this.ordersService.createOrderFromCart(user.userId);
		} catch {
			throw new BadRequestException('Invalid token');
		}
	}
}
