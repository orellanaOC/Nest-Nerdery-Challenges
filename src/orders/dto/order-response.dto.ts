/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ObjectType, Field, Int } from '@nestjs/graphql';
import { OrderLine } from '../order-lines/entities/order-line.entity';
import { OrderStatus } from '@prisma/client';

@ObjectType()
export class OrderResponse {
	@Field(() => Int)
	id: number;

	@Field(() => Int)
	userId: number;

	@Field(() => OrderStatus)
	status: OrderStatus;

	@Field(() => Int)
	total: number;

	@Field(() => [OrderLine], { nullable: 'items' })
	lines: OrderLine[];

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}
