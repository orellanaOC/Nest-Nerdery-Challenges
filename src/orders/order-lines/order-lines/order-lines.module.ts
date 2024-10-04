import { Module } from '@nestjs/common';
import { OrderLinesService } from './order-lines.service';
import { OrderLinesResolver } from './order-lines.resolver';
import { ProductsModule } from 'src/products/products.module';

@Module({
	imports: [ProductsModule],
	providers: [OrderLinesService, OrderLinesResolver],
	exports: [OrderLinesService],
})
export class OrderLinesModule {}
