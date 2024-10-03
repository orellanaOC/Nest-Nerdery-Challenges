import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as passport from 'passport';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const config = new DocumentBuilder()
		.setTitle('Eco-friendly store')
		.setDescription(
			`A REST API for a sustainable, eco-friendly store that sells organic products, reusable items, and green living essentials. Customers can browse through categories like reusable bottles, eco-friendly bags, and organic snacks. The API supports user authentication, product search by category, cart management, and order processing. Managers can add, update, or remove products, while customers can view detailed product descriptions, make purchases, and track their orders.`,
		)
		.setVersion('0.1')
		.addBearerAuth()
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	app.use(passport.initialize());

	await app.listen(3000);
}

bootstrap();
