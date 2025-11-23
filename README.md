# Bitcoin POS System - Hackathon Demo

A complete Bitcoin payment system demonstrating how BTC can be used for daily transactions. Includes a customer mobile app, vendor web dashboard, and backend API.

## Project Structure

```
.
├── backend/              # Node.js + TypeScript + PostgreSQL
├── customer-app/         # React Native mobile app
├── vendor-dashboard/     # React + Vite web dashboard
└── README.md
```

## Tech Stack

### Backend
- Node.js + TypeScript
- Express.js
- PostgreSQL + Prisma
- JWT authentication
- Docker Compose

### Customer App
- React Native
- NativeWind (Tailwind for RN)
- React Native Reanimated
- React Native Camera/QR Scanner

### Vendor Dashboard
- React + Vite
- TypeScript
- Tailwind CSS
- shadcn/ui components

## Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Quick Setup (TL;DR)

1. **Backend:**
```bash
cd backend
docker-compose up -d
npm install
npm run db:generate
npm run db:migrate
npm run db:seed  # Optional: seed demo data
npm run dev
```

2. **Vendor Dashboard:**
```bash
cd vendor-dashboard
npm install
npm run dev
```

3. **Customer App:**
```bash
cd customer-app
npm install
npm start
# Then press 'i' for iOS or 'a' for Android
```

**Demo Accounts** (after seeding):
- Customer: `customer@example.com` / `password123`
- Vendor: `vendor@example.com` / `password123`

**Credit Card Testing:**
- Success: Cards starting with `4242`
- Failure: Any other card number

## Features

### Customer App
- ✅ Login/Signup
- ✅ Balance display (BTC & Sbtc)
- ✅ Add funds with dummy card
- ✅ QR code scanner for payments
- ✅ Payment confirmation
- ✅ Transaction history
- ✅ Modern UI with animations

### Vendor Dashboard
- ✅ Login/Signup
- ✅ Product management
- ✅ Cart builder
- ✅ QR code generator
- ✅ Transaction list
- ✅ Dashboard statistics
- ✅ Dummy card payment processing

### Backend
- ✅ User authentication
- ✅ Wallet management
- ✅ Transaction processing
- ✅ Product management
- ✅ QR order generation
- ✅ Dummy card payment simulation

## Currency System

- **BTC**: Standard Bitcoin unit
- **Sbtc**: Scaled Bitcoin unit (1 Sbtc = 0.0000001 BTC)

## API Documentation

See `/backend/README.md` for detailed API documentation.

## Project Structure

```
bitcoin-pos-system/
├── backend/              # Node.js + TypeScript + Express + PostgreSQL
│   ├── src/
│   │   ├── routes/      # API routes (auth, customer, vendor, admin)
│   │   ├── utils/       # Utilities (auth, constants)
│   │   └── index.ts     # Entry point
│   ├── prisma/          # Database schema and migrations
│   └── docker-compose.yml
├── vendor-dashboard/     # React + Vite + TypeScript web dashboard
│   ├── src/
│   │   ├── pages/       # Pages (Dashboard, Products, QR, Transactions)
│   │   ├── components/  # UI components (Button, Card, Input)
│   │   └── utils/       # API client and utilities
│   └── package.json
├── customer-app/         # React Native + Expo mobile app
│   ├── src/
│   │   ├── screens/     # Screens (Login, Home, QR Scanner, Payment, etc.)
│   │   ├── components/  # Reusable UI components
│   │   ├── navigation/  # Navigation setup
│   │   └── context/     # Auth context
│   └── package.json
├── README.md             # This file
└── SETUP.md              # Detailed setup guide
```

## Documentation

- [SETUP.md](./SETUP.md) - Complete setup guide with troubleshooting
- [backend/README.md](./backend/README.md) - Backend API documentation
- [vendor-dashboard/README.md](./vendor-dashboard/README.md) - Vendor dashboard documentation
- [customer-app/README.md](./customer-app/README.md) - Mobile app documentation

## License

MIT

