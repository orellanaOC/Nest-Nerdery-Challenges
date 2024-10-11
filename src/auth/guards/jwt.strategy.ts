import {
	Injectable, UnauthorizedException
} from '@nestjs/common';
import {
	PassportStrategy
} from '@nestjs/passport';
import {
	ExtractJwt, Strategy
} from 'passport-jwt';
import {
	ConfigService
} from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('JWT_SECRET'),
		});
	}

	async validate(payload: any) {
		if (!payload || !payload.user_id || !payload.role_id) {
			throw new UnauthorizedException(
				'Invalid token: Missing userId or roleId',
			);
		}

		return {
			userId: payload.user_id,
			roleId: payload.role_id,
			email: payload.email,
			uuid: payload.uuid || null,
		};
	}
}
