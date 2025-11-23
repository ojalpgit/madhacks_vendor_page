import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../utils/api';
import { Product, CartItem, QRData } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Plus, Minus, QrCode, X } from 'lucide-react';
import colors from '../utils/colors';

export default function QRGenerator() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/vendor/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.productId === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          quantity: 1,
          priceBtc: product.priceBtc,
          priceSbtc: product.priceSbtc,
          product,
        },
      ]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const calculateTotal = () => {
    const totalBTC = cart.reduce(
      (sum, item) => sum + item.priceBtc * item.quantity,
      0
    );
    const totalSbtc = cart.reduce(
      (sum, item) => sum + item.priceSbtc * item.quantity,
      0
    );
    return { totalBTC, totalSbtc };
  };

  const generateQR = async () => {
    if (cart.length === 0) {
      alert('Add items to cart first');
      return;
    }

    try {
      const { totalBTC, totalSbtc } = calculateTotal();
      const response = await api.post('/api/vendor/create-qr-order', {
        cartItems: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceBtc: item.priceBtc,
          priceSbtc: item.priceSbtc,
        })),
      });

      setQrData(response.data.qrData);
      setShowQR(true);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to generate QR code');
    }
  };

  const sbtcFromBtc = (btc: number) => (btc * 10000000).toFixed(2);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const { totalBTC, totalSbtc } = calculateTotal();

  return (
    <div className="p-8" style={{ backgroundColor: colors.background }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: colors.textDark }}>QR Code Generator</h1>
        <p className="mt-2" style={{ color: colors.textLight }}>Build a cart and generate a payment QR code</p>
      </div>

      {showQR && qrData && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg p-8 max-w-md w-full relative" style={{ backgroundColor: colors.white }}>
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 hover:opacity-70 transition-opacity"
              style={{ color: colors.textDark }}
            >
              <X size={24} />
            </button>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4" style={{ color: colors.primary }}>Payment QR Code</h2>
              <div className="p-4 rounded-lg inline-block mb-4" style={{ backgroundColor: colors.white }}>
                <QRCodeSVG value={JSON.stringify(qrData)} size={256} />
              </div>
              <div className="text-lg font-medium" style={{ color: colors.textDark }}>
                <div>{totalBTC.toFixed(8)} BTC</div>
                <div style={{ color: colors.textLight }}>{sbtcFromBtc(totalBTC)} Sbtc</div>
              </div>
              <p className="text-sm mt-4" style={{ color: colors.textLight }}>
                Customer scans this QR code to complete payment
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white border" style={{ borderColor: colors.border }}>
          <CardHeader>
            <CardTitle style={{ color: colors.textDark }}>Products</CardTitle>
            <CardDescription style={{ color: colors.textLight }}>Add products to the cart</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-opacity-50 transition-colors"
                  style={{ borderColor: colors.border, backgroundColor: colors.background }}
                >
                  <div className="flex-1">
                    <h3 className="font-medium" style={{ color: colors.textDark }}>{product.name}</h3>
                    {product.description && (
                      <p className="text-sm" style={{ color: colors.textLight }}>{product.description}</p>
                    )}
                    <div className="mt-1">
                      <span className="font-medium" style={{ color: colors.primary }}>
                        {product.priceBtc.toFixed(8)} BTC
                      </span>
                      <span className="ml-2" style={{ color: colors.textLight }}>
                        ({sbtcFromBtc(product.priceBtc)} Sbtc)
                      </span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => addToCart(product)}
                    style={{ backgroundColor: colors.accent, color: colors.white }}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              ))}
              {products.length === 0 && (
                <p className="text-center py-8" style={{ color: colors.textLight }}>
                  No products available. Add products first.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border" style={{ borderColor: colors.border }}>
          <CardHeader>
            <CardTitle style={{ color: colors.textDark }}>Cart</CardTitle>
            <CardDescription style={{ color: colors.textLight }}>Selected items for payment</CardDescription>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-center py-8" style={{ color: colors.textLight }}>Cart is empty</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map((item) => {
                    const product = products.find((p) => p.id === item.productId);
                    return (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between p-4 border rounded-lg"
                        style={{ borderColor: colors.border }}
                      >
                        <div className="flex-1">
                          <h3 className="font-medium" style={{ color: colors.textDark }}>
                            {product?.name || 'Unknown'}
                          </h3>
                          <div className="text-sm" style={{ color: colors.textLight }}>
                            {item.priceBtc.toFixed(8)} BTC × {item.quantity}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            style={{ borderColor: colors.border, color: colors.textDark }}
                          >
                            <Minus size={16} />
                          </Button>
                          <span className="w-8 text-center" style={{ color: colors.textDark }}>{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            style={{ borderColor: colors.border, color: colors.textDark }}
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t pt-4 mb-4" style={{ borderColor: colors.border }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium" style={{ color: colors.textDark }}>Total:</span>
                    <div className="text-right">
                      <div className="text-xl font-bold" style={{ color: colors.primary }}>
                        {totalBTC.toFixed(8)} BTC
                      </div>
                      <div style={{ color: colors.textLight }}>{sbtcFromBtc(totalBTC)} Sbtc</div>
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={generateQR}
                  style={{ backgroundColor: colors.accent, color: colors.white }}
                >
                  <QrCode size={20} className="mr-2" />
                  Generate QR Code
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

