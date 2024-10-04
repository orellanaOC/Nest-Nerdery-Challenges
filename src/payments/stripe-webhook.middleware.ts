import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class StripeWebhookMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		req.rawBody = '';

		req.on('data', (chunk) => {
			req.rawBody += chunk;
		});

		req.on('end', () => {
			next();
		});

		req.on('error', (err) => {
			console.error('Error in request stream:', err);
			res.sendStatus(500);
		});
	}
}
