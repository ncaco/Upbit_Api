import { useEffect, useState, useMemo } from 'react';
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
}

interface OrderBookProps {
  market: string;
}

export function OrderBook({ market }: OrderBookProps) {
  const { subscribe, lastMessage } = useWebSocket();
  const [orderbook, setOrderbook] = useState<OrderbookData | null>(null);

  useEffect(() => {
    subscribe('orderbook', [market]);
    return () => {
      setOrderbook(null);
    };
  }, [subscribe, market]);

  useEffect(() => {
    if (lastMessage?.type === 'orderbook') {
      setOrderbook(lastMessage as WebSocketOrderbookMessage);
    }
  }, [lastMessage]);

  const maxSize = useMemo(() => Math.max(
    ...orderbook?.orderbook_units?.map(unit => unit.ask_size) || [0],
    ...orderbook?.orderbook_units?.map(unit => unit.bid_size) || [0]
  ), [orderbook?.orderbook_units]);

  return (
    <Card className="bg-white border-0 shadow-none">
      <div className="border-b border-gray-200 py-3 px-4">
        <h2 className="text-sm font-medium text-gray-900">호가</h2>
      </div>
      <div className="text-xs">
        {/* 헤더 */}
        <div className="grid grid-cols-3 py-2 px-4 text-gray-500 border-b border-gray-100">
          <div className="text-left">가격(KRW)</div>
          <div className="text-right">수량(BTC)</div>
          <div className="text-right">누적량</div>
        </div>
        
        {/* 매도 호가 */}
        <div className="asks">
          {orderbook?.orderbook_units?.slice().reverse().map((unit, i) => {
            const ratio = (unit.ask_size / maxSize) * 100;
            return (
              <div key={i} className="relative">
                <div 
                  className="absolute inset-0 bg-[#ff363617]" 
                  style={{ width: `${ratio}%`, right: 0 }}
                />
                <div className="grid grid-cols-3 py-[3px] px-4 relative">
                  <div className="text-left text-[#d24f45]">{formatNumber(unit.ask_price)}</div>
                  <div className="text-right">{unit.ask_size.toFixed(4)}</div>
                  <div className="text-right text-gray-500">{unit.ask_size.toFixed(4)}</div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 현재가 */}
        <div className="py-3 px-4 text-center bg-gray-50 border-y border-gray-100">
          <span className="text-[#d24f45] text-sm font-medium">
            {formatNumber(orderbook?.orderbook_units?.[0]?.bid_price || 0)}
          </span>
        </div>
        
        {/* 매수 호가 */}
        <div className="bids">
          {orderbook?.orderbook_units?.map((unit, i) => {
            const ratio = (unit.bid_size / maxSize) * 100;
            return (
              <div key={i} className="relative">
                <div 
                  className="absolute inset-0 bg-[#1261c417]" 
                  style={{ width: `${ratio}%` }}
                />
                <div className="grid grid-cols-3 py-[3px] px-4 relative">
                  <div className="text-left text-[#1261c4]">{formatNumber(unit.bid_price)}</div>
                  <div className="text-right">{unit.bid_size.toFixed(4)}</div>
                  <div className="text-right text-gray-500">{unit.bid_size.toFixed(4)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
} 