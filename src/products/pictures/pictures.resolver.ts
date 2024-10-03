import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PicturesService } from './pictures.service';
import { Picture } from './entities/picture.entity';
import { CreatePictureDto } from './dto/create-picture.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Resolver(() => Picture)
export class PicturesResolver {
	constructor(private readonly picturesService: PicturesService) {}

	@Mutation(() => Picture, {
		description: 'Add images. Requires authentication with Manager role.',
	})
	@Roles(2)
	@UseGuards(GqlAuthGuard, RolesGuard)
	createPicture(@Args('data') data: CreatePictureDto) {
		return this.picturesService.create(data);
	}
}
