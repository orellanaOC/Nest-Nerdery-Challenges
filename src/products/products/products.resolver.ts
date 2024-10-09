import { Resolver, Query, Args, Mutation, Int, Context } from '@nestjs/graphql';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Message } from '../messages/entities/message.entity';
import { ProductConnection } from './dto/product-connection.entity';
import { PaginationInput } from 'src/pagination/dto/pagination-input.dto';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CategoryFilter } from '../categories/dto/category-filter.dto';
@Resolver(() => Product)
export class ProductsResolver {
	constructor(private productService: ProductsService) {}

	@Query(() => ProductConnection)
	async products(
		// prettier-ignore
		@Args('pagination', { type: () => PaginationInput, nullable: true }) pagination: PaginationInput,
		// prettier-ignore
		@Args('category', { type: () => CategoryFilter, nullable: true }) category?: CategoryFilter,
	): Promise<ProductConnection> {
		return this.productService.getAllProducts(pagination, category);
	}

	@Query(() => Product, { nullable: true })
	async product(@Args('id', { type: () => Int }) id: number) {
		return this.productService.getProductById(id);
	}

	@Mutation(() => Product, {
		description:
			'Create a new product. Requires authentication with Manager role.',
	})
	@Roles(2)
	@UseGuards(GqlAuthGuard, RolesGuard)
	async createProduct(
		@Args('data') data: CreateProductDto,
	): Promise<Product> {
		return this.productService.create(data);
	}

	@Mutation(() => Product, {
		description:
			'Update a product. Requires authentication with Manager role.',
	})
	@Roles(2)
	@UseGuards(GqlAuthGuard, RolesGuard)
	async updateProduct(
		@Args('id', { type: () => Int }) id: number,
		@Args('data') data: UpdateProductDto,
	): Promise<Product> {
		return this.productService.update(id, data);
	}

	@Mutation(() => Product, {
		description:
			'Toggle Product Enable Status. Requires authentication with Manager role.',
	})
	@Roles(2)
	@UseGuards(GqlAuthGuard, RolesGuard)
	async toggleProductEnableStatus(
		@Args('id', { type: () => Int }) id: number,
		@Args('enable', { type: () => Boolean }) enable: boolean,
	): Promise<Product> {
		return this.productService.toggleProductEnableStatus(id, enable);
	}

	@Mutation(() => Message, {
		description: 'Like product. Requires authentication.',
	})
	@UseGuards(GqlAuthGuard)
	async likeProduct(
		@Args('productId') productId: number,
		@Context() context: any,
	): Promise<Message> {
		try {
			const { user } = context.req;

			return this.productService.toggleLikeProduct(
				user.userId,
				productId,
			);
		} catch {
			throw new BadRequestException('Invalid token');
		}
	}
}
