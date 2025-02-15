import { useQuery } from '@tanstack/react-query';
import { account } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

export function Assets() {
  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => account.getAccounts(),
  });

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="text-lg font-bold mb-4">보유자산 현황</h2>
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="pb-2">자산</th>
              <th className="pb-2">보유수량</th>
              <th className="pb-2">매수평균가</th>
              <th className="pb-2">평가금액</th>
            </tr>
          </thead>
          <tbody>
            {accounts?.data?.map((account) => (
              <tr key={account.currency}>
                <td className="py-2">{account.currency}</td>
                <td className="py-2">{account.balance}</td>
                <td className="py-2">{formatNumber(parseFloat(account.avg_buy_price))}원</td>
                <td className="py-2">
                  {formatNumber(parseFloat(account.balance) * parseFloat(account.avg_buy_price))}원
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
} 