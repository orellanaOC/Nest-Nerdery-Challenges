import { Module } from '@nestjs/common';
import { OrderLinesModule } from './order-lines/order-lines/order-lines.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrdersService } from './orders/orders.service';
import { OrdersResolver } from './orders/orders.resolver';
import { ShoppingCartsModule } from 'src/shopping-cart/shopping-carts.module';

@Module({
	imports: [OrderLinesModule, ShoppingCartsModule],
	providers: [PrismaService, OrdersService, OrdersResolver],
	exports: [OrdersService],
})
export class OrdersModule {}
