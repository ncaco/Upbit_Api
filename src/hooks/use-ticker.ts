import { useEffect, useState } from 'react';
import { useWebSocket } from './use-upbit-websocket';
import { WebSocketTickerMessage } from '@/types/websocket';

export function useTicker(market: string) {
  const { subscribe, unsubscribe, lastMessage } = useWebSocket();
  const [ticker, setTicker] = useState<WebSocketTickerMessage | null>(null);

  useEffect(() => {
    subscribe('ticker', [market]);
    return () => unsubscribe('ticker', [market]);
  }, [market, subscribe, unsubscribe]);

  useEffect(() => {
    if (lastMessage?.type === 'ticker' && lastMessage.code === market) {
      setTicker(lastMessage);
    }
  }, [lastMessage, market]);

  return ticker;
} 