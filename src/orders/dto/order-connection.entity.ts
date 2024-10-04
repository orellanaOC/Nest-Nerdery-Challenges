/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ObjectType, Field } from '@nestjs/graphql';
import { Order } from '../entities/order.entity';
import { IPaginatedType } from 'src/pagination/entities/pagination.interface';
import { PageInfoModel } from 'src/pagination/entities/page-info.entity';
import { OrderEdge } from '../entities/order-edge.entity';

@ObjectType()
export class OrderConnection implements IPaginatedType<Order> {
    @Field(() => [OrderEdge], { nullable: 'items' })
    edges: OrderEdge[];

    @Field()
    pageInfo: PageInfoModel;
}