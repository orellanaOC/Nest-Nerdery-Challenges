/* eslint-disable indent */
import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
} from '@nestjs/common';
import {
ConfigService
} from '@nestjs/config';
import {
OrdersService
} from 'src/orders/orders/orders.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
	private stripe: Stripe;

	constructor(
		private configService: ConfigService,
		@Inject(forwardRef(() => OrdersService))
		private readonly ordersService: OrdersService,
	) {
		this.stripe = new Stripe(
			this.configService.get<string>('STRIPE_SECRET_KEY'),
		);
	}

	constructEvent(payload: any, signature: string) {
		try {
			return this.stripe.webhooks.constructEvent(
				payload,
				signature,
				this.configService.get<string>('STRIPE_WEBHOOK_SECRET'),
			);
		} catch (err) {
			throw new BadRequestException(`Webhook Error: ${err.message}`);
		}
	}

	private getRandomPaymentMethod(): string {
		const paymentMethods = ['pm_card_visa_chargeDeclined', 'pm_card_visa'];
		const randomIndex = Math.floor(Math.random() * paymentMethods.length);

		return paymentMethods[randomIndex];
	}

	async createPaymentIntent(amount: number, currency: string) {
		const paymentIntent = await this.stripe.paymentIntents.create({
			amount,
			currency,
			payment_method: this.getRandomPaymentMethod(),
			// confirm: true,
			automatic_payment_methods: {
				enabled: true,
				allow_redirects: 'never',
			},
		});
		console.log('PaymentIntent created:', paymentIntent.id);

		return paymentIntent;
	}

	async confirmPaymentIntent(paymentIntentId: string) {
		try {
			const paymentIntent =
				await this.stripe.paymentIntents.confirm(paymentIntentId);
			console.log('PaymentIntent confirmed:', paymentIntent.id);
			return paymentIntent;
		} catch (error) {
			throw new BadRequestException(
				`Failed to confirm PaymentIntent: ${error.message}`,
			);
		}
	}

	async orderStatusChange(paymentIntentId: string, successful: boolean) {
		console.log(
			`Updating order status for PaymentIntent: ${paymentIntentId}`,
		);

		this.ordersService.orderStatusChange(paymentIntentId, successful);
	}

	async handleWebhookEvent(event: Stripe.Event) {
		switch (event.type) {
			case 'payment_intent.succeeded':
				await this.ordersService.orderStatusChange(
					event.data.object.id,
					true,
				);
				console.log({
paymentIntent: event.data.object.id
});
				break;
			case 'payment_intent.payment_failed':
				await this.ordersService.orderStatusChange(
					event.data.object.id,
					false,
				);
				break;
			case 'payment_intent.created':
				await this.confirmPaymentIntent(event.data.object.id);
				break;
			default:
				console.log(`Unhandled event type ${event.type}.`);
		}
	}
}
