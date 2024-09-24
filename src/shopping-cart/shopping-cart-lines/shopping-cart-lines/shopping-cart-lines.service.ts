import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ShoppingCartLinesService {
	constructor(private readonly prisma: PrismaService) {}

	async getLinesByCartId(shoppingCartId: number) {
		return this.prisma.shoppingCartLine.findMany({
			where: { shoppingCartId },
			include: {
				product: {
					include: {
						category: true,
						picture: true,
					},
				},
			},
		});
	}
}
