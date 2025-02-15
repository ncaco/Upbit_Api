import { useQuery } from '@tanstack/react-query';
import { market } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

export function RecentTrades() {
  const { data: trades } = useQuery({
    queryKey: ['trades', 'KRW-BTC'],
    queryFn: () => market.getTrades('KRW-BTC'),
    refetchInterval: 1000,
  });

  return (
    <Card className="p-4">
      <h2 className="text-lg font-bold mb-4">최근 체결 내역</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500">
              <th className="pb-2">시간</th>
              <th className="pb-2">가격</th>
              <th className="pb-2">수량</th>
              <th className="pb-2">체결금액</th>
            </tr>
          </thead>
          <tbody>
            {trades?.data?.map((trade) => (
              <tr key={trade.sequential_id} className="text-sm">
                <td className="py-1">
                  {new Date(trade.timestamp).toLocaleTimeString()}
                </td>
                <td className={`py-1 ${
                  trade.side === 'ASK' ? 'text-blue-500' : 'text-red-500'
                }`}>
                  {formatNumber(trade.trade_price)}
                </td>
                <td className="py-1">{trade.trade_volume}</td>
                <td className="py-1">
                  {formatNumber(trade.trade_price * trade.trade_volume)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
} 