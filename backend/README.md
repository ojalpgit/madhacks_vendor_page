# Backend API - Bitcoin POS System

Node.js + TypeScript + Express + PostgreSQL backend API.

## Setup

1. **Start PostgreSQL with Docker:**
```bash
docker-compose up -d
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Generate Prisma client:**
```bash
npm run db:generate
```

5. **Run database migrations:**
```bash
npm run db:migrate
```

6. **Start the server:**
```bash
npm run dev
```

Server runs on `http://localhost:3001`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user
  - Body: `{ email, password, name, role: "CUSTOMER" | "VENDOR" }`
  
- `POST /api/auth/login` - Login
  - Body: `{ email, password }`

### Customer Routes (require auth + CUSTOMER role)

- `GET /api/customer/balance` - Get wallet balance
- `POST /api/customer/add-funds-card` - Add funds with dummy card
  - Body: `{ cardNumber, amount, cardHolderName, expiryDate, cvv }`
- `POST /api/customer/pay` - Pay vendor (from QR code)
  - Body: `{ vendorId, cartItems, totalBTC, totalSbtc, orderId? }`
- `GET /api/customer/transactions` - Get transaction history

### Vendor Routes (require auth + VENDOR role)

- `POST /api/vendor/add-product` - Add product
  - Body: `{ name, description?, priceBtc, imageUrl? }`
- `PUT /api/vendor/products/:id` - Update product
- `DELETE /api/vendor/products/:id` - Delete product
- `GET /api/vendor/products` - Get vendor's products
- `POST /api/vendor/create-qr-order` - Create QR code order
  - Body: `{ cartItems: [{ productId, quantity, priceBtc, priceSbtc }] }`
- `GET /api/vendor/transactions` - Get vendor transactions
- `GET /api/vendor/dashboard/stats` - Get dashboard statistics
- `POST /api/vendor/charge-card` - Charge card (add funds)

### Admin Routes

- `GET /api/admin/list-users` - List all users (debugging)

## Currency System

- **BTC**: Standard Bitcoin unit (stored with 8 decimal places)
- **Sbtc**: Scaled Bitcoin unit (1 Sbtc = 0.0000001 BTC, displayed with 2 decimal places)

## Database Schema

See `prisma/schema.prisma` for full schema details.

## Dummy Card Payment

- Cards starting with `4242` = Success
- All other cards = Failed

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

