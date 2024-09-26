/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ObjectType, Field } from '@nestjs/graphql';
import { Order } from './order.entity';
import { Edge } from 'src/pagination/entities/pagination.interface';

@ObjectType()
export class OrderEdge implements Edge<Order> {
    @Field() 
    cursor: string;
    
    @Field(() => Order) 
    node: Order;
}