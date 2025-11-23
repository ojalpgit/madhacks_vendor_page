import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Transaction } from '../types';
import { Card, CardContent } from '../components/ui/Card';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import colors from '../utils/colors';

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

  // Calculate USD value (mock conversion: 1 BTC = 40,000 USD)
  const btcToUsd = (btc: number) => {
    return (btc * 40000).toFixed(2);
  };

  // Format BTC amount
  const formatBTC = (btc: number) => {
    return btc.toFixed(8);
  };

  // Get transaction type label
  const getTransactionType = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return 'Sale';
      case 'ADD_FUNDS':
        return 'Purchase';
      case 'REFUND':
        return 'Refund';
      default:
        return type;
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'Processed':
        return colors.success;
      case 'FAILED':
      case 'Error':
        return colors.error;
      case 'PENDING':
      case 'Created':
        return colors.textLight;
      default:
        return colors.textLight;
    }
  };

  // Calculate gain percentage (mock calculation)
  const calculateGain = (transaction: Transaction) => {
    // Mock: random gain between -5% and 10%
    return Math.random() > 0.5 ? Math.random() * 10 : -Math.random() * 5;
  };

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
        <h1 className="text-3xl font-bold" style={{ color: colors.textDark }}>Transactions</h1>
        <p className="mt-2" style={{ color: colors.textLight }}>View all payment transactions</p>
      </div>

      <Card className="bg-white border" style={{ borderColor: colors.border }}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: colors.border }}>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: colors.textLight }}>
                    Date
                  </th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: colors.textLight }}>
                    Type
                  </th>
                  <th className="text-right p-4 text-sm font-medium" style={{ color: colors.textLight }}>
                    Value in USD
                  </th>
                  <th className="text-right p-4 text-sm font-medium" style={{ color: colors.textLight }}>
                    Value in BTC
                  </th>
                  <th className="text-right p-4 text-sm font-medium" style={{ color: colors.textLight }}>
                    Gains
                  </th>
                  <th className="text-center p-4 text-sm font-medium" style={{ color: colors.textLight }}>
                    Status
                  </th>
                  <th className="text-center p-4 text-sm font-medium" style={{ color: colors.textLight }}>
                    Receipt
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8" style={{ color: colors.textLight }}>
                      No transactions yet
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => {
                    const usdValue = btcToUsd(transaction.amountBtc);
                    const btcValue = formatBTC(transaction.amountBtc);
                    const gain = calculateGain(transaction);
                    const isPositive = gain > 0;

                    return (
                      <tr
                        key={transaction.id}
                        className="border-b hover:bg-opacity-50 transition-colors"
                        style={{ borderColor: colors.border }}
                      >
                        <td className="p-4 text-sm" style={{ color: colors.textDark }}>
                          {format(new Date(transaction.createdAt), 'd MMMM, yyyy')}
                        </td>
                        <td className="p-4 text-sm font-medium" style={{ color: colors.textDark }}>
                          {getTransactionType(transaction.type)}
                        </td>
                        <td className="p-4 text-sm text-right font-medium" style={{ color: colors.textDark }}>
                          ${usdValue}
                        </td>
                        <td className="p-4 text-sm text-right" style={{ color: colors.textDark }}>
                          {btcValue} BTC
                        </td>
                        <td className="p-4 text-sm text-right">
                          {gain !== 0 ? (
                            <span style={{ color: isPositive ? colors.success : colors.error }}>
                              {isPositive ? '↑' : '↓'} {Math.abs(gain).toFixed(2)}%
                            </span>
                          ) : (
                            <span style={{ color: colors.textLight }}>—</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${getStatusColor(transaction.status)}20`,
                              color: getStatusColor(transaction.status),
                            }}
                          >
                            {transaction.status === 'COMPLETED' ? 'Processed' : 
                             transaction.status === 'FAILED' ? 'Error' : 
                             transaction.status === 'PENDING' ? 'Created' : transaction.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            className="p-2 hover:bg-opacity-50 rounded transition-colors"
                            style={{ color: colors.textLight }}
                            title="Download receipt"
                          >
                            <Download size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

