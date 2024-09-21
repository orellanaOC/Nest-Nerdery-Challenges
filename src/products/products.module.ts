import { Module } from '@nestjs/common';
import { ProductsResolver } from './products/products.resolver';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductsService } from './products/products.service';

@Module({
	providers: [ProductsService, ProductsResolver, PrismaService],
})
export class ProductsModule {}
