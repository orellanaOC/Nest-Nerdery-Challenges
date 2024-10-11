import {
	forwardRef, Module
} from '@nestjs/common';
import {
	PaymentsController
} from './payments.controller';
import {
	PaymentsService
} from './payments.service';
import {
	ConfigModule
} from '@nestjs/config';
import {
	OrdersModule
} from 'src/orders/orders.module';

@Module({
	imports: [ConfigModule, forwardRef(() => OrdersModule)],
	controllers: [PaymentsController],
	providers: [PaymentsService],
	exports: [PaymentsService],
})
export class PaymentsModule {}
