import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ShoppingCartsModule } from 'src/shopping-cart/shopping-carts.module';
import { UsersModule } from 'src/users/users.module';

@Module({
	controllers: [AuthController],
	providers: [JwtService, AuthService],
	imports: [
		forwardRef(() => ShoppingCartsModule),
		forwardRef(() => UsersModule),
	],
	exports: [AuthService],
})
export class AuthModule {}
