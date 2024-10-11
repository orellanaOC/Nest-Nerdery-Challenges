import {
	Module
} from '@nestjs/common';
import {
	PicturesService
} from './pictures.service';
import {
	PicturesResolver
} from './pictures.resolver';
import {
	JwtService
} from '@nestjs/jwt';

@Module({
	providers: [PicturesResolver, PicturesService, JwtService],
	exports: [PicturesService],
})
export class PicturesModule {}
