import { Resolver, Query, Args, Mutation, Int, Context } from '@nestjs/graphql';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Message } from '../messages/entities/message.entity';
import { ProductConnection } from './dto/product-connection.entity';
import { PaginationInput } from 'src/pagination/dto/pagination-input.dto';

@Resolver(() => Product)
export class ProductsResolver {
	constructor(private productService: ProductsService) {}

	@Query(() => ProductConnection)
	async products(
		// prettier-ignore
		@Args('pagination', { type: () => PaginationInput, nullable: true }) pagination: PaginationInput,
	): Promise<ProductConnection> {
		return this.productService.getAllProducts(pagination);
	}

	@Query(() => Product, { nullable: true })
	async product(@Args('id', { type: () => Int }) id: number) {
		return this.productService.getProductById(id);
	}

	@Mutation(() => Product)
	async createProduct(
		@Args('data') data: CreateProductDto,
	): Promise<Product> {
		return this.productService.create(data);
	}

	@Mutation(() => Product)
	async updateProduct(
		@Args('id', { type: () => Int }) id: number,
		@Args('data') data: UpdateProductDto,
	): Promise<Product> {
		return this.productService.update(id, data);
	}

	@Mutation(() => Product)
	async toggleProductEnableStatus(
		@Args('id', { type: () => Int }) id: number,
		@Args('enable', { type: () => Boolean }) enable: boolean,
	): Promise<Product> {
		return this.productService.toggleProductEnableStatus(id, enable);
	}

	// TODO: add the userID by header/token
	@Mutation(() => Message)
	async likeProduct(
		@Args('productId') productId: number, // Product ID passed in the mutation
		// @Context() context: any, // Use the context to extract token from headers
	): Promise<Message> {
		// Extract the user/client ID from the token
		// const req: Request = context.req;
		// const userId = this.extractUserIdFromToken(req.headers.authorization);

		// Call the service to like the product
		return this.productService.toggleLikeProduct(/*userId,*/ 4, productId);
	}
}
