import { Resolver, Query, Args, Mutation, Int } from '@nestjs/graphql';
import { ProductsService } from './products.service';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Resolver(() => Product)
export class ProductsResolver {
	constructor(private productService: ProductsService) {}

	@Query(() => [Product])
	async products() {
		return this.productService.getAllProducts();
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
}
