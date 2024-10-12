import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException,
} from '@nestjs/common';
import {
	Reflector
} from '@nestjs/core';
import {
	GqlExecutionContext
} from '@nestjs/graphql';
import {
	ROLES_KEY
} from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<number[]>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()],
		);

		if (!requiredRoles) {
			return true;
		}

		const ctx = GqlExecutionContext.create(context);
		const {
			user
		} = ctx.getContext().req;

		if (!user || !requiredRoles.includes(user.roleId)) {
			throw new ForbiddenException(
				'You do not have permission to access this resource',
			);
		}

		return true;
	}
}
