/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import {
ObjectType, Field
} from '@nestjs/graphql';
import {
Edge
} from 'src/pagination/entities/pagination.interface';
import {
Product
} from './product.entity';

@ObjectType()
export class ProductEdge implements Edge<Product> {
	@Field(() => String)
	cursor: string;

	@Field(() => Product)
	node: Product;
}
