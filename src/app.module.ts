import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ArticlesModule } from './articles/articles.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ProductsModule } from './products/products.module';
import { ProductsService } from './products/products/products.service';
import { ProductsResolver } from './products/products/products.resolver';
import { CategoriesModule } from './products/categories/categories.module';
import { ShoppingCartsService } from './shopping-cart/shopping-cart/shopping-cart.service';
import { ShoppingCartResolver } from './shopping-cart/shopping-cart/shopping-cart.resolver';
import { ShoppingCartLinesResolver } from './shopping-cart/shopping-cart-lines/shopping-cart-lines/shopping-cart-lines.resolver';
import { ShoppingCartLinesService } from './shopping-cart/shopping-cart-lines/shopping-cart-lines/shopping-cart-lines.service';
import { PicturesResolver } from './products/pictures/pictures.resolver';
import { PicturesService } from './products/pictures/pictures.service';

@Module({
	imports: [
		PrismaModule,
		ArticlesModule,
		ProductsModule,
		CategoriesModule,
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
			playground: true,
		}),
	],
	controllers: [AppController],
	providers: [
		AppService,
		ProductsService,
		ProductsResolver,
		PicturesService,
		PicturesResolver,
		ShoppingCartLinesResolver,
		ShoppingCartLinesService,
		ShoppingCartsService,
		ShoppingCartResolver,
	],
})
export class AppModule {}
