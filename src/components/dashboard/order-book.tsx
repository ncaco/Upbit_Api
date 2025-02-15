import { useEffect, useState, useMemo, memo } from 'react';
import { Card } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import { useWebSocket } from '@/hooks/use-websocket';
import { WebSocketOrderbookMessage } from '@/types/websocket';

interface OrderbookUnit {
  ask_price: number;
  bid_price: number;
  ask_size: number;
  bid_size: number;
}

interface OrderbookData {
  type: string;
  code: string;
  orderbook_units: OrderbookUnit[];
  timestamp: number;
}

const OrderBookRow = memo(({ 
  price, 
  size, 
  maxSize, 
  type 
}: { 
  price: number; 
  size: number; 
  maxSize: number; 
  type: 'ask' | 'bid';
}) => (
  <div className="grid grid-cols-3 text-sm">
    <span className={type === 'ask' ? 'text-[#c84a31]' : 'text-[#1261c4]'}>
      {formatNumber(price)}
    </span>
    <span className="text-center text-gray-600">
      {formatNumber(size)}
    </span>
    <div className="relative h-full">
      <div 
        className={`absolute inset-0 ${type === 'ask' ? 'bg-[#ffeaea]' : 'bg-[#ebf6ff]'} opacity-40`}
        style={{ width: `${(size / maxSize) * 100}%` }} 
      />
    </div>
  </div>
));

export function OrderBook() {
  const { subscribe, lastMessage } = useWebSocket();
  const [orderbook, setOrderbook] = useState<OrderbookData | null>(null);

  useEffect(() => {
    subscribe('orderbook', ['KRW-BTC']);
    return () => {
      setOrderbook(null);
    };
  }, [subscribe]);

  useEffect(() => {
    if (lastMessage?.type === 'orderbook') {
      setOrderbook(prev => {
        if (prev?.timestamp === lastMessage.timestamp) return prev;
        return lastMessage as WebSocketOrderbookMessage;
      });
    }
  }, [lastMessage]);

  const maxSize = useMemo(() => Math.max(
    ...orderbook?.orderbook_units?.map(unit => unit.ask_size) || [0],
    ...orderbook?.orderbook_units?.map(unit => unit.bid_size) || [0]
  ), [orderbook?.orderbook_units]);

  const asks = useMemo(() => 
    orderbook?.orderbook_units?.slice().reverse().map((unit, index) => (
      <OrderBookRow
        key={`ask-${unit.ask_price}`}
        price={unit.ask_price}
        size={unit.ask_size}
        maxSize={maxSize}
        type="ask"
      />
    )), [orderbook?.orderbook_units, maxSize]);

  const bids = useMemo(() => 
    orderbook?.orderbook_units?.map((unit, index) => (
      <OrderBookRow
        key={`bid-${unit.bid_price}`}
        price={unit.bid_price}
        size={unit.bid_size}
        maxSize={maxSize}
        type="bid"
      />
    )), [orderbook?.orderbook_units, maxSize]);

  return (
    <Card className="p-4 bg-[#f9f9f9]">
      <h2 className="text-sm text-gray-500 mb-4">호가</h2>
      <div className="space-y-1">
        <div className="asks space-y-1">{asks}</div>
        <div className="bids space-y-1">{bids}</div>
      </div>
    </Card>
  );
} 