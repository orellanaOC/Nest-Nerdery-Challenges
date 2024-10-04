# Eco-Friendly Store

## Overview

Eco-Friendly Store is a sustainable and eco-friendly e-commerce platform built with NestJS, Prisma, and Stripe for payment processing. The application provides functionalities for both managers and clients, including product management, order processing, and payment handling.

## Features

- **User Authentication**: Sign up, sign in, and manage user sessions.
- **Product Management**: Managers can create, update, disable, and delete products. Clients can view products and product with details.
- **Order Management**: Clients can view their orders, and managers can track client orders.
- **Stripe Integration**: Secure payment processing with Stripe, including webhook handling for payment events.
- **GraphQL and REST API**: Supports both GraphQL queries and REST API endpoints for flexible usage.

## Technologies Used

- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **Prisma**: An open-source database toolkit that simplifies database access and management.
- **Stripe**: A payment processing platform that provides APIs for online transactions.
- **PostgreSQL**: A powerful, open-source relational database system.

## Installation

### Prerequisites

- Node.js (version 14 or later)
- PostgreSQL database
- Stripe account for payment processing

### Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/orellanaOC/Nest-Nerdery-Challenges eco-friendly-store
   cd eco-friendly-store
   ```
2. **Install Dependencies**
    ```bash
    npm install
    ```

3. **Set Up Environment Variables**
Create a `.env` file in the root of the project and configure the necessary environment variables:
    ```env
    JWT_SECRET=your_jwt_key
    STRIPE_SECRET_KEY=your_stripe_secret_key
    STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
    DATABASE_URL=postgresql://user:password@localhost:5432/mydatabase
    PORT=3000
    ```
4. **Run Database Migrations**
Make sure to run migrations to set up the database schema:
    ```bash
    npx prisma migrate dev --name init
    ```

5. **Seed the Database (Optional)**
You can seed the database with initial data using the seed script:
    ```bash
    npx prisma db seed
    ```

6. **Start the Development Server**
    ```bash
    npm run start:dev
    ```
The server should now be running on `http://localhost:3000`.

## Usage
### API REST Endpoints
- Authentication
    - Sign Up
        `POST /auth/sign-up`
        Description: Registers a new user and creates a shopping cart.
        Request Body:
        ```json
        {
          "name": "John Doe",
          "email": "john.doe@example.com",
          "password": "yourStrongPassword123"
        }
        ```
        Responses:
            - 201 Created: User successfully registered.
            - 400 Bad Request: Missing or invalid fields.
            - 409 Conflict: The email already exists.
            - 500 Internal Server Error: Unexpected error during registration.
        
    - Sign In
        `POST /auth/sign-in`
        Description: Authenticates a user and returns a JWT token.
        Request Body:
        ```json
        {
          "email": "john.doe@example.com",
          "password": "yourStrongPassword123"
        }
        ```
        Responses:
            - 200 OK: Authentication successful, returns JWT token.
            - 401 Unauthorized: Invalid credentials.
            - 403 Forbidden: Email not verified.
            - 500 Internal Server Error: Error generating token.
        
    - Forgot Password
        `POST /auth/forgot-password`
        Description: Initiates the password reset process.
        Request Body:
        ```json
        {
          "email": "john.doe@example.com"
        }
        ```
        Responses:
            - 200 OK: Reset token sent to email.
            - 500 Internal Server Error: Error generating reset token.
        
    - Reset Password
        `POST /auth/new-password`
        Description: Sets a new password using the reset token.
        Request Body:
        ```json
        {
          "resetToken": "yourResetToken",
          "newPassword": "newStrongPassword456"
        }
        ```
        Responses:
            - 200 OK: Password successfully updated.
            - 400 Bad Request: Invalid or expired reset token.
            - 401 Unauthorized: Invalid token.

    - Change Password
        `POST /auth/reset-password  
        Description: Changes the user's current password.
        Request Body:
        ```json
        {
          "currentPassword": "yourCurrentPassword",
          "newPassword": "newStrongPassword789"
        }
        ```
        Responses:
            - 200 OK: Password changed successfully.
            - 400 Bad Request: Missing current or new password.
            - 401 Unauthorized: Invalid token.
        
    - Sign Out
        `POST /auth/sign-out`
        Description: Signs out the user by invalidating the token.
        Responses:
            - 200 OK: Successfully signed out.
            - 401 Unauthorized: Invalid or missing token.
            - 500 Internal Server Error: Error during sign out.

### GraphQL API Endpoints
#### Orders
- **Order by ID**
  - **Query**: `order(id: Int!): Order`
  - **Description**: Fetches an order by its ID. Requires authentication with Manager role or the logged user ID.
  - **Parameters**:
    - `id`: The ID of the order to retrieve.
  - **Response**: Returns the requested `Order` object.

- **My Orders**
  - **Query**: `myOrders(filter: OrderFilter): OrderConnection`
  - **Description**: Fetches the orders of the currently logged-in user. Requires authentication.
  - **Parameters**:
    - `filter`: Optional filter criteria for retrieving orders.
  - **Response**: Returns a connection of `Order` objects.

- **All Orders**
  - **Query**: `orders(filter: OrderFilter): OrderConnection`
  - **Description**: Fetches all orders. Requires authentication with Manager role.
  - **Parameters**:
    - `filter`: Optional filter criteria for retrieving orders.
  - **Response**: Returns a connection of `Order` objects.

- **Checkout**
  - **Mutation**: `checkouts: Order`
  - **Description**: Creates a new order from the user's shopping cart. Requires authentication.
  - **Response**: Returns the created `Order` object.

#### Shopping Cart

- **My Shopping Cart**
  - **Query**: `myShoppingCart: ShoppingCart`
  - **Description**: Fetches the shopping cart of the currently logged-in user. Requires authentication.
  - **Response**: Returns the `ShoppingCart` object.

- **Update Shopping Cart**
  - **Mutation**: `updateShoppingCart(shoppingCartLineInput: ShoppingCartLineInput): ShoppingCart`
  - **Description**: Updates the shopping cart with the specified line input. Requires authentication.
  - **Parameters**:
    - `shoppingCartLineInput`: The input data for updating the shopping cart.
  - **Response**: Returns the updated `ShoppingCart` object.

#### Products

- **Fetch All Products**
  - **Query**: `products(pagination: PaginationInput): ProductConnection`
  - **Description**: Retrieves a paginated list of all products.
  - **Parameters**:
    - `pagination`: Optional pagination parameters.
  - **Response**: Returns a connection of `Product` objects.

- **Fetch Product by ID**
  - **Query**: `product(id: Int!): Product`
  - **Description**: Retrieves a product by its ID.
  - **Parameters**:
    - `id`: The ID of the product to retrieve.
  - **Response**: Returns the requested `Product` object.

- **Create Product**
  - **Mutation**: `createProduct(data: CreateProductDto): Product`
  - **Description**: Creates a new product. Requires authentication with Manager role.
  - **Parameters**:
    - `data`: The data required to create the product.
  - **Response**: Returns the created `Product` object.

- **Update Product**
  - **Mutation**: `updateProduct(id: Int!, data: UpdateProductDto): Product`
  - **Description**: Updates an existing product. Requires authentication with Manager role.
  - **Parameters**:
    - `id`: The ID of the product to update.
    - `data`: The updated data for the product.
  - **Response**: Returns the updated `Product` object.

- **Toggle Product Enable Status**
  - **Mutation**: `toggleProductEnableStatus(id: Int!, enable: Boolean!): Product`
  - **Description**: Toggles the enable status of a product. Requires authentication with Manager role.
  - **Parameters**:
    - `id`: The ID of the product.
    - `enable`: A boolean indicating whether to enable or disable the product.
  - **Response**: Returns the updated `Product` object.

- **Like Product**
  - **Mutation**: `likeProduct(productId: Int!): Message`
  - **Description**: Likes a product. Requires authentication.
  - **Parameters**:
    - `productId`: The ID of the product to like.
  - **Response**: Returns a message indicating the success of the action.

#### Pictures

- **Upload Picture**
  - **Mutation**: `uploadPicture(data: CreatePictureDto): Picture`
  - **Description**: Uploads a new image. Requires authentication with Manager role.
  - **Parameters**:
    - `data`: The data required to create a picture.
  - **Response**: Returns the created `Picture` object.