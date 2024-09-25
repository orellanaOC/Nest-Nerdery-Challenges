import { Module } from '@nestjs/common';
import { OrderLinesService } from './order-lines.service';
import { OrderLinesResolver } from './order-lines.resolver';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductsModule } from 'src/products/products.module';

@Module({
	imports: [ProductsModule],
	providers: [OrderLinesService, OrderLinesResolver, PrismaService],
	exports: [OrderLinesService],
})
export class OrderLinesModule {}
