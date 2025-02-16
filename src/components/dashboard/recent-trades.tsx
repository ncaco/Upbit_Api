import { useQuery } from '@tanstack/react-query';
import { market } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import type { Trade } from '@/lib/api/market';

interface RecentTradesProps {
  market: string;
}

export function RecentTrades({ market: marketCode }: RecentTradesProps) {
  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['trades', marketCode],
    queryFn: async () => {
      const response = await market.getTrades(marketCode);
      return response.data;
    },
    refetchInterval: 1000
  });

  if (isLoading || trades.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-medium text-gray-900">체결 내역</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">체결시간</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">체결가격(KRW)</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">체결량({marketCode.split('-')[1]})</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">체결금액(KRW)</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade: Trade) => {
              const tradeTime = new Date(trade.timestamp);
              const isAsk = trade.ask_bid === 'ASK';
              const priceColor = isAsk ? 'text-[#1261c4]' : 'text-[#d24f45]';
              
              return (
                <tr key={trade.sequential_id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-xs text-gray-500">
                    {tradeTime.toLocaleTimeString()}
                  </td>
                  <td className={`px-4 py-2 text-xs text-right ${priceColor}`}>
                    {formatNumber(trade.trade_price)}
                  </td>
                  <td className="px-4 py-2 text-xs text-right text-gray-900">
                    {trade.trade_volume.toFixed(8)}
                  </td>
                  <td className="px-4 py-2 text-xs text-right text-gray-900">
                    {formatNumber(trade.trade_price * trade.trade_volume)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 