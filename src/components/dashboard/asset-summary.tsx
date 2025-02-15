import { useQuery } from '@tanstack/react-query';
import { account } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

export function AssetSummary() {
  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => account.getAccounts(),
  });

  return (
    <Card className="p-4">
      <h2 className="text-lg font-bold mb-4">자산 현황</h2>
      <div className="space-y-2">
        {accounts?.data?.map((account) => (
          <div key={account.currency} className="flex justify-between">
            <span>{account.currency}</span>
            <span>{formatNumber(parseFloat(account.balance))}</span>
          </div>
        ))}
      </div>
    </Card>
  );
} 