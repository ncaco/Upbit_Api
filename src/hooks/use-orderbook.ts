import { useEffect, useState } from 'react';
import { useWebSocket } from './use-upbit-websocket';
import { WebSocketOrderbookMessage } from '@/types/websocket';

export function useOrderbook(market: string) {
  const { subscribe, unsubscribe, lastMessage } = useWebSocket();
  const [orderbook, setOrderbook] = useState<WebSocketOrderbookMessage | null>(null);

  useEffect(() => {
    subscribe('orderbook', [market]);
    return () => unsubscribe('orderbook', [market]);
  }, [market, subscribe, unsubscribe]);

  useEffect(() => {
    if (lastMessage?.type === 'orderbook' && lastMessage.code === market) {
      setOrderbook(lastMessage);
    }
  }, [lastMessage, market]);

  return orderbook;
} 