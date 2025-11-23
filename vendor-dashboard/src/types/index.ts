export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'VENDOR';
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  description: string | null;
  priceBtc: number;
  priceSbtc: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  priceBtc: number;
  priceSbtc: number;
  product?: Product;
}

export interface QRData {
  vendorId: string;
  orderId?: string;
  cartItems: CartItem[];
  totalBTC: number;
  totalSbtc: number;
}

export interface Transaction {
  id: string;
  senderId: string;
  receiverId: string;
  amountBtc: number;
  amountSbtc: number;
  type: 'PAYMENT' | 'ADD_FUNDS' | 'REFUND';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  orderId: string | null;
  description: string | null;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
  };
  receiver: {
    id: string;
    name: string;
    email: string;
  };
  order?: {
    id: string;
    items: Array<{
      id: string;
      quantity: number;
      product: Product;
    }>;
  };
}

export interface DashboardStats {
  wallet: {
    btc: number;
    sbtc: number;
    btcFormatted: string;
    sbtcFormatted: string;
  } | null;
  totalTransactions: number;
  totalRevenue: {
    btc: number;
    sbtc: number;
    btcFormatted: string;
    sbtcFormatted: string;
  };
  totalProducts: number;
}

