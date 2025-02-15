import { useEffect } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';
import { Card } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import { WebSocketTickerMessage } from '@/types/websocket';

export function RealTimePrice() {
  const { lastMessage, subscribe } = useWebSocket();
  const tickerData = lastMessage?.type === 'ticker' ? lastMessage as WebSocketTickerMessage : null;

  useEffect(() => {
    subscribe('ticker', ['KRW-BTC']);
  }, [subscribe]);

  const getChangeColor = () => {
    if (!tickerData) return 'text-gray-900';
    switch (tickerData.change) {
      case 'RISE':
        return 'text-red-500';
      case 'FALL':
        return 'text-blue-500';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <Card className="p-4">
      <h2 className="text-lg font-bold mb-4">실시간 가격</h2>
      <div className={`text-3xl font-bold ${getChangeColor()}`}>
        {tickerData ? formatNumber(tickerData.trade_price) : '-'}
        <span className="text-sm text-gray-500 ml-1">KRW</span>
      </div>
      {tickerData && (
        <>
          <div className="text-sm text-gray-500 mt-2">
            거래량: {formatNumber(tickerData.acc_trade_volume_24h)} BTC
          </div>
          <div className="text-sm mt-1">
            <span className={getChangeColor()}>
              {tickerData.signed_change_rate > 0 ? '+' : ''}
              {(tickerData.signed_change_rate * 100).toFixed(2)}%
            </span>
            <span className="text-gray-500 ml-2">
              고가: {formatNumber(tickerData.high_price)}
            </span>
            <span className="text-gray-500 ml-2">
              저가: {formatNumber(tickerData.low_price)}
            </span>
          </div>
        </>
      )}
    </Card>
  );
} 