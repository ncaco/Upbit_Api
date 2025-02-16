import { useTicker } from '@/hooks/use-ticker';
import { formatNumber } from '@/lib/utils';

interface RealTimePriceProps {
  market: string;
}

export function RealTimePrice({ market }: RealTimePriceProps) {
  const ticker = useTicker(market);

  if (!ticker) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32" />
      </div>
    );
  }

  const isPositive = ticker.change === 'RISE';
  const changeColor = isPositive ? 'text-[#d24f45]' : 'text-[#1261c4]';
  const changeSign = isPositive ? '+' : '';
  const changeRate = (ticker.change_rate * 100).toFixed(2);

  return (
    <div className="space-y-1">
      <div className="text-2xl font-bold">
        {formatNumber(ticker.trade_price)}
        <span className="text-sm text-gray-500 ml-1">KRW</span>
      </div>
      <div className={`text-sm ${changeColor}`}>
        {changeSign}{changeRate}% ({changeSign}{formatNumber(ticker.change_price)})
      </div>
      <div className="text-xs text-gray-500">
        거래량: {formatNumber(ticker.acc_trade_volume)} {market.split('-')[1]}
      </div>
    </div>
  );
} 