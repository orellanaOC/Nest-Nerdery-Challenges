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

@Module({
	imports: [
		PrismaModule,
		ArticlesModule,
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
			playground: true,
		}),
		ProductsModule,
	],
	controllers: [AppController],
	providers: [AppService, ProductsService, ProductsResolver],
})
export class AppModule {}
