/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { OrderLine } from '../order-lines/entities/order-line.entity';
import { OrderStatus } from '@prisma/client';

registerEnumType(OrderStatus, {
	name: 'OrderStatus',
	description:
		'Represents the current state of an order, indicating whether it is pending, successfully completed, or failed due to an issue.',
});
@ObjectType()
export class Order {
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