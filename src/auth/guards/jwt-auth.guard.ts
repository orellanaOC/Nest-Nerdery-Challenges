import {
	ExecutionContext, Injectable, Logger 
} from '@nestjs/common';
import {
	Reflector
} from '@nestjs/core';
import {
	AuthGuard
} from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	private readonly logger = new Logger(JwtAuthGuard.name);

	constructor(private reflector: Reflector) {
		super();
	}

	canActivate(context: ExecutionContext) {
		this.logger.log('Activating JWT Guard');
		return super.canActivate(context);
	}
}
