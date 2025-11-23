# Bitcoin POS - Vendor Dashboard

React web dashboard for vendors to manage products, generate QR codes, and view transactions.

## Features

- ✅ Login/Signup
- ✅ Product management (add, edit, delete)
- ✅ Cart builder
- ✅ QR code generator
- ✅ Transaction history
- ✅ Dashboard statistics
- ✅ Dummy credit card payment support

## Setup

### Prerequisites

- Node.js 18+
- Backend API running on port 3001

### Installation

1. Install dependencies:
```bash
cd vendor-dashboard
npm install
```

2. Start development server:
```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Environment Variables

Create a `.env` file:
```
VITE_API_URL=http://localhost:3001
```

## Testing

### Demo Accounts

Use the seeded demo accounts:
- Email: `vendor@example.com`
- Password: `password123`

Or create a new vendor account via signup.

### Credit Card Testing

- **Success**: Use any card starting with `4242`
- **Failure**: Use any other card number

## Project Structure

```
vendor-dashboard/
├── src/
│   ├── pages/            # Page components
│   ├── components/       # Reusable UI components
│   ├── utils/            # Utility functions
│   └── types/            # TypeScript types
├── index.html
└── package.json
```

## Usage

1. **Login/Signup**: Create or login to your vendor account
2. **Dashboard**: View your wallet balance, revenue, and statistics
3. **Products**: Add, edit, or delete products
4. **QR Generator**: Build a cart and generate a payment QR code
5. **Transactions**: View all payment transactions

