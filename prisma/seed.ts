import { PrismaClient } from '@prisma/client';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
	// create dummy data

	// CATEGORIES
	await prisma.category.upsert({
		where: { name: 'Sustainable Clothing' },
		update: {},
		create: {
			name: 'Sustainable Clothing',
		},
	});

	await prisma.category.upsert({
		where: { name: 'Zero Waste Products' },
		update: {},
		create: {
			name: 'Zero Waste Products',
		},
	});

	await prisma.category.upsert({
		where: { name: 'Eco-Friendly Home Goods' },
		update: {},
		create: {
			name: 'Eco-Friendly Home Goods',
		},
	});

	await prisma.category.upsert({
		where: { name: 'Organic Beauty Products' },
		update: {},
		create: {
			name: 'Organic Beauty Products',
		},
	});

	await prisma.category.upsert({
		where: { name: 'Recycled Accessories' },
		update: {},
		create: {
			name: 'Recycled Accessories',
		},
	});

	await prisma.category.upsert({
		where: { name: 'Green Cleaning Supplies' },
		update: {},
		create: {
			name: 'Green Cleaning Supplies',
		},
	});

	await prisma.category.upsert({
		where: { name: 'Renewable Energy Gadgets' },
		update: {},
		create: {
			name: 'Renewable Energy Gadgets',
		},
	});

	await prisma.category.upsert({
		where: { name: 'Eco-Friendly Kitchenware' },
		update: {},
		create: {
			name: 'Eco-Friendly Kitchenware',
		},
	});

	await prisma.category.upsert({
		where: { name: 'Sustainable Pet Supplies' },
		update: {},
		create: {
			name: 'Sustainable Pet Supplies',
		},
	});

	await prisma.category.upsert({
		where: { name: 'Ethical Furniture' },
		update: {},
		create: {
			name: 'Ethical Furniture',
		},
	});

	// ROLES
	await prisma.role.upsert({
		where: { name: 'client' },
		update: {},
		create: {
			name: 'client',
		},
	});

	await prisma.role.upsert({
		where: { name: 'manager' },
		update: {},
		create: {
			name: 'manager',
		},
	});

	// PRODUCTS
	const mockProducts = [
		{
			name: 'Solar Panel Charger',
			price: 5999,
			specification: 'Portable solar panel charger for your devices.',
			stock: 509,
		},
		{
			name: 'Wind Turbine Generator',
			price: 19999,
			specification: 'Mini wind turbine for home use.',
			stock: 158,
		},
		{
			name: 'Eco-Friendly Power Bank',
			price: 2999,
			specification: 'Rechargeable power bank powered by solar energy.',
			stock: 100,
		},
		{
			name: 'Solar Garden Lights',
			price: 2499,
			specification: 'LED solar lights for your garden or pathway.',
			stock: 200,
		},
		{
			name: 'Hydro Power Generator',
			price: 14999,
			specification: 'Generate electricity from flowing water.',
			stock: 190,
		},
		{
			name: 'Solar Backpack',
			price: 8999,
			specification:
				'Backpack with built-in solar panel for device charging.',
			stock: 302,
		},
		{
			name: 'Solar-Powered Fan',
			price: 3499,
			specification: 'Small portable fan powered by solar energy.',
			stock: 745,
		},
		{
			name: 'Solar Oven',
			price: 29999,
			specification: 'Cook your meals using solar energy.',
			stock: 450,
		},
		{
			name: 'Wind-Up Flashlight',
			price: 1999,
			specification: 'Eco-friendly flashlight powered by manual winding.',
			stock: 250,
		},
		{
			name: 'BioLite CampStove',
			price: 14999,
			specification: 'Wood-burning stove that generates electricity.',
			stock: 430,
		},
		{
			name: 'Solar Lantern',
			price: 3999,
			specification: 'Portable lantern powered by solar energy.',
			stock: 120,
		},
		{
			name: 'Hand-Crank Radio',
			price: 4999,
			specification: 'Emergency radio powered by hand-cranking.',
			stock: 65,
		},
		{
			name: 'Solar Water Heater',
			price: 49999,
			specification:
				'Energy-efficient water heater powered by solar energy.',
			stock: 829,
		},
		{
			name: 'Wind Turbine Kit',
			price: 29999,
			specification: 'DIY wind turbine kit for generating electricity.',
			stock: 129,
		},
		{
			name: 'Solar Power Bank with Light',
			price: 4499,
			specification: 'Power bank with built-in LED light.',
			stock: 150,
		},
		{
			name: 'Portable Solar Power Bank',
			price: 3499,
			specification:
				'Portable power bank with solar charging capability.',
			stock: 150,
		},
		{
			name: 'Wind-Powered Phone Charger',
			price: 5999,
			specification:
				'Phone charger that uses wind energy to generate power.',
			stock: 40,
		},
		{
			name: 'Solar Water Bottle',
			price: 2499,
			specification:
				'Water bottle with a built-in solar-powered UV sterilizer.',
			stock: 80,
		},
		{
			name: 'Solar Camping Shower',
			price: 2999,
			specification: 'Solar-powered portable shower for camping trips.',
			stock: 30,
		},
		{
			name: 'Solar-Powered Bluetooth Speaker',
			price: 7499,
			specification: 'Outdoor Bluetooth speaker powered by solar energy.',
			stock: 60,
		},
		{
			name: 'Mini Wind Turbine',
			price: 12999,
			specification: 'Compact wind turbine for personal use.',
			stock: 25,
		},
		{
			name: 'Solar Air Purifier',
			price: 5499,
			specification:
				'Air purifier powered by solar energy for off-grid use.',
			stock: 100,
		},
		{
			name: 'Solar Powered Camera',
			price: 11999,
			specification: 'Surveillance camera powered by solar panels.',
			stock: 50,
		},
		{
			name: 'Rechargeable Solar Batteries',
			price: 1999,
			specification:
				'Eco-friendly rechargeable batteries with solar charging.',
			stock: 500,
		},
		{
			name: 'Solar Powered Tent',
			price: 29999,
			specification:
				'Tent equipped with solar panels for charging your gadgets.',
			stock: 100,
		},
		{
			name: 'Eco-Friendly Solar Flashlight',
			price: 1599,
			specification: 'Solar-powered flashlight for emergencies.',
			stock: 250,
		},
		{
			name: 'Solar Charging Station',
			price: 89999,
			specification: 'Large solar station for charging multiple devices.',
			stock: 500,
		},
		{
			name: 'Wind-Powered Fan',
			price: 5999,
			specification: 'Portable fan powered by wind energy.',
			stock: 75,
		},
		{
			name: 'Solar-Powered Electric Grill',
			price: 39999,
			specification: 'Electric grill powered entirely by solar energy.',
			stock: 20,
		},
		{
			name: 'Solar-Powered Lawn Mower',
			price: 79999,
			specification: 'Lawn mower powered by solar panels.',
			stock: 128,
		},
		{
			name: 'Solar LED Bike Light',
			price: 2999,
			specification: 'Bike light powered by solar energy.',
			stock: 300,
		},
		{
			name: 'Solar Powered Cooler',
			price: 15999,
			specification: 'Portable cooler that runs on solar power.',
			stock: 25,
		},
		{
			name: 'Hand-Crank Solar Radio',
			price: 4499,
			specification:
				'Radio that works by hand-cranking and solar charging.',
			stock: 60,
		},
		{
			name: 'Solar-Powered Phone Case',
			price: 2499,
			specification:
				'Phone case with built-in solar charger for extended battery life.',
			stock: 180,
		},
		{
			name: 'Wind-Powered LED Lamp',
			price: 3299,
			specification: 'LED lamp powered by wind energy.',
			stock: 12,
		},
	];

	for (const product of mockProducts) {
		const createdProduct = await prisma.product.create({
			data: {
				name: product.name,
				specification: product.specification,
				price: product.price,
				stock: product.stock,
				categoryId: Math.floor(Math.random() * 10) + 1, // Generating random category ID between 1 and 10
			},
		});

		const random = Math.floor(Math.random() * 6);

		for (let i = 1; i <= random; i++) {
			await prisma.picture.create({
				data: {
					imageUrl: `https://example.com/image${createdProduct.id}.jpg`,
					productId: createdProduct.id,
				},
			});
		}
	}

	async function generateMockData() {
		const productCount = await prisma.product.count();

		// Create 10 users with roleId = 1 (Client)
		for (let i = 1; i <= 10; i++) {
			const user = await prisma.user.create({
				data: {
					email: `client${i}@example.com`,
					password: `password${i}`,
					name: `Client ${i}`,
					roleId: 1, // Client role
				},
			});

			// Create a shopping cart for each user
			let total = 0;

			const shoppingCart = await prisma.shoppingCart.create({
				data: {
					userId: user.id,
				},
			});

			// Add 10 lines to the shopping cart (with random products)
			for (let j = 1; j <= 10; j++) {
				const productId = Math.floor(Math.random() * productCount) + 1;

				const existingLine = await prisma.shoppingCartLine.findFirst({
					where: {
						shoppingCartId: shoppingCart.userId,
						productId: productId,
					},
				});

				if (!existingLine) {
					const product = await prisma.product.findUnique({
						where: { id: productId },
					});
					const quantity = Math.floor(Math.random() * 5) + 1;

					total += product.price * quantity;

					await prisma.shoppingCartLine.create({
						data: {
							shoppingCartId: shoppingCart.userId,
							productId: productId,
							productQuantity: quantity,
						},
					});
				}
			}

			await prisma.shoppingCart.update({
				where: {
					userId: shoppingCart.userId,
				},
				data: {
					total: total,
				},
			});

			const firstProductId = ((i - 1) * 4 + 1) % productCount;

			for (let k = 0; k < 4; k++) {
				const productId = ((firstProductId + k) % productCount) + 1;

				const existingLike = await prisma.likeProduct.findUnique({
					where: {
						userId_productId: {
							userId: user.id,
							productId: productId,
						},
					},
				});

				if (!existingLike) {
					await prisma.likeProduct.create({
						data: {
							userId: user.id,
							productId: productId,
						},
					});
				}
			}
		}
	}
	await generateMockData();
}

// execute the main function
main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		// close Prisma Client at the end
		await prisma.$disconnect();
	});
