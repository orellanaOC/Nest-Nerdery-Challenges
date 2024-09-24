import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PicturesService } from './pictures.service';
import { Picture } from './entities/picture.entity';
import { CreatePictureDto } from './dto/create-picture.dto';

@Resolver(() => Picture)
export class PicturesResolver {
	constructor(private readonly picturesService: PicturesService) {}

	@Mutation(() => Picture)
	createPicture(@Args('data') data: CreatePictureDto) {
		return this.picturesService.create(data);
	}
}
