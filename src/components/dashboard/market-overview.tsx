'use client';

import { useQuery } from '@tanstack/react-query';
import { market } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import type { Ticker } from '@/lib/api/market';

interface MarketOverviewProps {
  market: string;
}

export function MarketOverview({ market: marketCode }: MarketOverviewProps) {
  const { data: ticker, isLoading } = useQuery({
    queryKey: ['ticker', marketCode],
    queryFn: async () => {
      const response = await market.getTicker(marketCode);
      return response.data[0];
    },
    refetchInterval: 1000
  });

  const [base, quote] = marketCode.split('-');

  if (isLoading || !ticker) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/6" />
          </div>
          <div className="grid grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isPositive = ticker.change === 'RISE';
  const changeColor = isPositive ? 'text-[#d24f45]' : 'text-[#1261c4]';
  const changeSign = isPositive ? '+' : '';
  const changeRate = (ticker.change_rate * 100).toFixed(2);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {quote}/{base}
          </h2>
          <div className="mt-1 text-sm text-gray-500">
            {quote === 'BTC' ? '비트코인' : quote}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            {formatNumber(ticker.trade_price)}
            <span className="text-sm text-gray-500 ml-1">{base}</span>
          </div>
          <div className={`mt-1 text-sm ${changeColor}`}>
            {changeSign}{changeRate}% ({changeSign}{formatNumber(ticker.change_price)})
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-6">
        <div>
          <div className="text-sm text-gray-500">거래량(24H)</div>
          <div className="mt-1 text-lg font-medium">
            {formatNumber(ticker.acc_trade_volume)} {quote}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">거래대금(24H)</div>
          <div className="mt-1 text-lg font-medium">
            {formatNumber(ticker.acc_trade_price)} {base}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">52주 최고</div>
          <div className="mt-1 text-lg font-medium">
            {formatNumber(ticker.highest_52_week_price)} {base}
          </div>
        </div>
      </div>
    </div>
  );
} 