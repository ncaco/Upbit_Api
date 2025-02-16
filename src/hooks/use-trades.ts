import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from './use-upbit-websocket';
import { WebSocketTradeMessage } from '@/types/websocket';

export function useTrades(market: string, limit = 50) {
  const { subscribe, unsubscribe, lastMessage } = useWebSocket();
  const [trades, setTrades] = useState<WebSocketTradeMessage[]>([]);

  useEffect(() => {
    subscribe('trade', [market]);
    return () => unsubscribe('trade', [market]);
  }, [market, subscribe, unsubscribe]);

  useEffect(() => {
    if (lastMessage?.type === 'trade' && lastMessage.code === market) {
      setTrades(prev => [lastMessage, ...prev].slice(0, limit));
    }
  }, [lastMessage, market, limit]);

  const clearTrades = useCallback(() => {
    setTrades([]);
  }, []);

  return {
    trades,
    clearTrades
  };
} 