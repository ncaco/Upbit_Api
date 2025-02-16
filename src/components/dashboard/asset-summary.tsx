import { useQuery } from '@tanstack/react-query';
import { account } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

interface Account {
  currency: string;
  balance: string;
  avg_buy_price: string;
  unit_currency: string;
}

export function AssetSummary() {
  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => account.getAccounts(),
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-medium text-gray-900">보유자산 현황</h2>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {accounts?.data?.map((account: Account) => {
            const balance = parseFloat(account.balance);
            const avgPrice = parseFloat(account.avg_buy_price);
            const totalValue = balance * avgPrice;
            
            return (
              <div key={account.currency} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{account.currency}</div>
                  <div className="text-sm text-gray-500">평균단가: {formatNumber(avgPrice)} {account.unit_currency}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{formatNumber(totalValue)} {account.unit_currency}</div>
                  <div className="text-sm text-gray-500">{balance.toFixed(8)} {account.currency}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 