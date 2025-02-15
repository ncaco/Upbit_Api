import { useQuery } from '@tanstack/react-query';
import { account } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

export function OrderHistory() {
  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => account.getOrders(),
    refetchInterval: 5000,
  });

  return (
    <Card className="p-4">
      <h2 className="text-lg font-bold mb-4">주문 내역</h2>
      <div className="space-y-2">
        {orders?.data?.map((order: any) => (
          <div key={order.uuid} className="p-2 border rounded">
            <div className="flex justify-between text-sm">
              <span>{order.side === 'bid' ? '매수' : '매도'}</span>
              <span className={order.side === 'bid' ? 'text-red-500' : 'text-blue-500'}>
                {formatNumber(order.price)}원
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{order.market}</span>
              <span>{order.volume} BTC</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
} 