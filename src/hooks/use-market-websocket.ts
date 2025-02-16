import { useEffect, useState, useCallback, useRef } from 'react';
import { useWebSocket } from './use-upbit-websocket';
import { WebSocketTickerMessage, WebSocketTradeMessage, WebSocketOrderbookMessage } from '@/types/websocket';

export function useMarketWebSocket(market: string) {
  const { subscribe, unsubscribe, lastMessage } = useWebSocket();
  const [ticker, setTicker] = useState<WebSocketTickerMessage | null>(null);
  const [trades, setTrades] = useState<WebSocketTradeMessage[]>([]);
  const [orderbook, setOrderbook] = useState<WebSocketOrderbookMessage | null>(null);
  const subscribed = useRef(false);

  useEffect(() => {
    if (subscribed.current) return;
    
    // 마켓 데이터 구독
    //console.log(`마켓 구독 시작: ${market}`);
    subscribe('ticker', [market]);
    subscribe('trade', [market]);
    subscribe('orderbook', [market]);
    
    subscribed.current = true;

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      //console.log(`마켓 구독 해제: ${market}`);
      if (subscribed.current) {
        unsubscribe('ticker', [market]);
        unsubscribe('trade', [market]);
        unsubscribe('orderbook', [market]);
        subscribed.current = false;
      }
    };
  }, [market, subscribe, unsubscribe]);

  useEffect(() => {
    if (!lastMessage || !subscribed.current) return;

    if (lastMessage.type === 'ticker' && lastMessage.code === market) {
      setTicker(lastMessage as WebSocketTickerMessage);
    } else if (lastMessage.type === 'trade' && lastMessage.code === market) {
      setTrades(prev => [lastMessage as WebSocketTradeMessage, ...prev].slice(0, 50));
    } else if (lastMessage.type === 'orderbook' && lastMessage.code === market) {
      setOrderbook(lastMessage as WebSocketOrderbookMessage);
    }
  }, [lastMessage, market]);

  const clearTrades = useCallback(() => {
    setTrades([]);
  }, []);

  return {
    ticker,
    trades,
    orderbook,
    clearTrades
  };
} 