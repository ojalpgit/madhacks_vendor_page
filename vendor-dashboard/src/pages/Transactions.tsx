import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Transaction } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { format } from 'date-fns';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/api/vendor/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-600 mt-2">View all payment transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No transactions yet</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        transaction.type === 'PAYMENT'
                          ? 'bg-green-100 text-green-600'
                          : transaction.type === 'ADD_FUNDS'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {transaction.type === 'PAYMENT' ? (
                        <ArrowDownRight size={20} />
                      ) : (
                        <ArrowUpRight size={20} />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {transaction.type === 'PAYMENT'
                          ? `Payment from ${transaction.sender.name}`
                          : transaction.type === 'ADD_FUNDS'
                          ? 'Funds Added'
                          : 'Refund'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(transaction.createdAt), 'PPp')}
                      </div>
                      {transaction.order?.items && transaction.order.items.length > 0 && (
                        <div className="text-sm text-gray-500 mt-1">
                          {transaction.order.items
                            .map((item) => `${item.quantity}x ${item.product.name}`)
                            .join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      +{transaction.amountBtc.toFixed(8)} BTC
                    </div>
                    <div className="text-sm text-gray-500">
                      {sbtcFromBtc(transaction.amountBtc)} Sbtc
                    </div>
                    <div
                      className={`text-xs mt-1 ${
                        transaction.status === 'COMPLETED'
                          ? 'text-green-600'
                          : transaction.status === 'FAILED'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {transaction.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

