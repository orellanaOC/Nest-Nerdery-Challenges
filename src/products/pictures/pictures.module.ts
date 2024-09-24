import { Module } from '@nestjs/common';
import { PicturesService } from './pictures.service';
import { PicturesResolver } from './pictures.resolver';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
	providers: [PicturesResolver, PicturesService, PrismaService],
})
export class PicturesModule {}
