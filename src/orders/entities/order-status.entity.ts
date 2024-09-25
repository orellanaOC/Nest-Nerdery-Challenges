import { registerEnumType } from '@nestjs/graphql';

export enum OrderStatus {
	PENDING = 'PENDING',
	SUCCEEDED = 'SUCCEEDED',
	FAILED = 'FAILED',
}

registerEnumType(OrderStatus, {
	name: 'OrderStatus',
	description:
		'Represents the current state of an order, indicating whether it is pending, successfully completed, or failed due to an issue.',
});
