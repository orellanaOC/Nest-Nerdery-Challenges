import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma/prisma.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ProductsModule } from './products/products.module';
import { ShoppingCartsModule } from './shopping-cart/shopping-carts.module';
import { OrdersModule } from './orders/orders.module';
import { PaginationModule } from './pagination/pagination.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PaymentsModule } from './payments/payments.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		AuthModule,
		PrismaModule,
		ProductsModule,
		ShoppingCartsModule,
		OrdersModule,
		UsersModule,
		PaginationModule,
		PaymentsModule,
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
			playground: true,
			context: ({ req }) => ({ req }),
		}),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
