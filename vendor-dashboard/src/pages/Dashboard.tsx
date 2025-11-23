import { useEffect, useState } from 'react';
import api from '../utils/api';
import { DashboardStats, Transaction } from '../types';
import { Card, CardContent } from '../components/ui/Card';
import { TrendingUp, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import colors from '../utils/colors';
import { Download } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchTransactions();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/vendor/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/api/vendor/transactions');
      setTransactions(response.data.slice(0, 4)); // Show only recent 4 transactions
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  // Calculate total wallet value in USD (mock conversion: 1 BTC = 40,000 USD)
  const btcToUsd = (btc: number) => {
    return (btc * 40000).toFixed(2);
  };

  // Calculate percentage change (mock: 24.67% increase)
  const percentageChange = 24.67;

  // Format BTC amount
  const formatBTC = (btc: number) => {
    return btc.toFixed(8);
  };

  // Format Sbtc amount
  const formatSbtc = (btc: number) => {
    return (btc * 10000000).toFixed(2);
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

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const walletBtc = stats?.wallet?.btcBalance || 0;
  const walletSbtc = stats?.wallet?.sbtcBalance || 0;
  const totalValueUsd = btcToUsd(walletBtc);

  return (
    <div className="p-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Total Wallet Value Card */}
        <Card className="bg-white border" style={{ borderColor: colors.border }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm mb-1" style={{ color: colors.textLight }}>
                  Total wallet value
                </p>
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-bold" style={{ color: colors.primary }}>
                    ${totalValueUsd}
                  </h2>
                  <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ backgroundColor: `${colors.success}20` }}>
                    <TrendingUp size={14} style={{ color: colors.success }} />
                    <span className="text-sm font-medium" style={{ color: colors.success }}>
                      ▲ {percentageChange}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.primary}10` }}>
                <TrendingUp size={24} style={{ color: colors.primary }} />
              </div>
            </div>
            <div className="pt-4 border-t" style={{ borderColor: colors.border }}>
              <p className="text-sm mb-2" style={{ color: colors.textLight }}>My cryptos</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: colors.textDark }}>Bitcoin BTC</p>
                  <p className="text-sm" style={{ color: colors.textLight }}>
                    {formatBTC(walletBtc)} BTC
                  </p>
                </div>
                <p className="text-lg font-semibold" style={{ color: colors.primary }}>
                  ${totalValueUsd}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bitcoin Balance Card */}
        <Card className="bg-white border" style={{ borderColor: colors.border }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm mb-1" style={{ color: colors.textLight }}>
                  Bitcoin balance
                </p>
                <h2 className="text-3xl font-bold" style={{ color: colors.primary }}>
                  {formatBTC(walletBtc)} BTC
                </h2>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.accent}20` }}>
                <Wallet size={24} style={{ color: colors.accent }} />
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t" style={{ borderColor: colors.border }}>
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: colors.textLight }}>
                  Available for transfer:
                </p>
                <p className="font-medium" style={{ color: colors.textDark }}>
                  {formatBTC(walletBtc * 0.88)} BTC
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: colors.textLight }}>
                  Available to sell:
                </p>
                <p className="font-medium" style={{ color: colors.textDark }}>
                  {formatBTC(walletBtc)} BTC
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History Table */}
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
                    const gain = Math.random() > 0.5 ? Math.random() * 10 : -Math.random() * 5;
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

