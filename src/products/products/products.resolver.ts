import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
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
	async product(@Args('id') id: number) {
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
		@Args('id') id: number,
		@Args('data') data: UpdateProductDto,
	): Promise<Product> {
		return this.productService.update(id, data);
	}
}
