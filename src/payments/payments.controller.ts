/* eslint-disable indent */
import {
	Controller,
	Post,
	HttpCode,
	HttpStatus,
	Req,
	Res,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import {
	ApiBadRequestResponse,
	ApiExcludeEndpoint,
	ApiHeader,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

@Controller('payments')
@ApiTags('payments')
export class PaymentsController {
	constructor(private readonly paymentsService: PaymentsService) {}

	@Post('webhooks')
	@HttpCode(HttpStatus.OK)
	// @ApiExcludeEndpoint()
	@ApiOperation({ summary: 'Handle Stripe webhook events (not for testing)' })
	@ApiHeader({
		name: 'stripe-signature',
		required: true,
		description: 'Stripe signature for webhook validation',
	})
	@ApiResponse({
		status: 200,
		description: 'Webhook event processed successfully.',
	})
	@ApiBadRequestResponse({
		description: 'Invalid webhook signature or payload.',
	})
	async orderStatus(@Req() req: Request, @Res() res: Response) {
		const sig = req.headers['stripe-signature'];
		const signature = Array.isArray(sig) ? sig[0] : sig;
		console.log({ sig });
		let event;
		try {
			event = this.paymentsService.constructEvent(req.body, signature);
			await this.paymentsService.handleWebhookEvent(event);

			return res.status(HttpStatus.OK).send({ received: true });
		} catch (error) {
			return res
				.status(HttpStatus.BAD_REQUEST)
				.send(`Webhook Error: ${error.message}`);
		}
	}
}
