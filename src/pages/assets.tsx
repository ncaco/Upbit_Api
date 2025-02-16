import { useQuery } from '@tanstack/react-query';
import { account } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

interface Account {
  currency: string;
  balance: string;
  avg_buy_price: string;
  unit_currency: string;
  avg_buy_price_modified: boolean;
  locked: string;
}

export default function AssetsPage() {
  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => account.getAccounts(),
  });

  const totalKRW = accounts?.data?.reduce((total: number, account: Account) => {
    if (account.unit_currency === 'KRW') {
      return total + (parseFloat(account.balance) * parseFloat(account.avg_buy_price));
    }
    return total;
  }, 0) || 0;

  return (
    <div className="layout-container">
      {/* 총 자산 */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">총 보유자산</h2>
        </div>
        <div className="card-body">
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(totalKRW)}
            <span className="text-sm text-gray-500 ml-1">KRW</span>
          </div>
        </div>
      </div>

      {/* 자산 목록 */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">보유자산 목록</h2>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>자산</th>
                  <th className="text-right">보유수량</th>
                  <th className="text-right">매수평균가</th>
                  <th className="text-right">평가금액</th>
                  <th className="text-right">잠금</th>
                </tr>
              </thead>
              <tbody>
                {accounts?.data?.map((account: Account) => {
                  const balance = parseFloat(account.balance);
                  const avgPrice = parseFloat(account.avg_buy_price);
                  const totalValue = balance * avgPrice;
                  const locked = parseFloat(account.locked);
                  
                  return (
                    <tr key={account.currency}>
                      <td className="font-medium text-gray-900">
                        {account.currency}
                        {account.avg_buy_price_modified && (
                          <span className="badge badge-warning ml-2">수정됨</span>
                        )}
                      </td>
                      <td className="text-right">{balance.toFixed(8)}</td>
                      <td className="text-right">
                        {formatNumber(avgPrice)} {account.unit_currency}
                      </td>
                      <td className="text-right">
                        {formatNumber(totalValue)} {account.unit_currency}
                      </td>
                      <td className="text-right text-gray-500">
                        {locked > 0 ? locked.toFixed(8) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 