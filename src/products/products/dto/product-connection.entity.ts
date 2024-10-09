/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ObjectType, Field } from '@nestjs/graphql';
import { IPaginatedType } from 'src/pagination/entities/pagination.interface';
import { Product } from '../entities/product.entity';
import { ProductEdge } from '../entities/product-edge.entity';
import { PageInfoModel } from 'src/pagination/entities/page-info.entity';

@ObjectType()
export class ProductConnection implements IPaginatedType<Product> {
	@Field(() => [ProductEdge], { nullable: 'items' })
	edges: ProductEdge[];

	@Field()
	pageInfo: PageInfoModel;
}
