import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ArticlesModule } from './articles/articles.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ProductsModule } from './productModule/products.module';
import { ProductsService } from './productModule/products/products.service';
import { ProductsResolver } from './productModule/products/products.resolver';
import { CategoriesModule } from './productModule/categories/categories.module';

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
	providers: [AppService, ProductsService, ProductsResolver],
})
export class AppModule {}
