import { useEffect, useState, useCallback, useRef } from 'react';
import { useWebSocket } from './use-upbit-websocket';
import { WebSocketTickerMessage, WebSocketTradeMessage, WebSocketOrderbookMessage } from '@/types/websocket';

export function useMarketWebSocket(market: string) {
  const { subscribe, unsubscribe, lastMessage } = useWebSocket();
  const [ticker, setTicker] = useState<WebSocketTickerMessage | null>(null);
  const [trades, setTrades] = useState<WebSocketTradeMessage[]>([]);
  const [orderbook, setOrderbook] = useState<WebSocketOrderbookMessage | null>(null);
  const prevMarketRef = useRef<string | null>(null);

  useEffect(() => {
    // 마켓이 변경된 경우에만 구독 갱신
    if (prevMarketRef.current !== market) {
      // 이전 마켓 구독 해제
      if (prevMarketRef.current) {
        unsubscribe('ticker', [prevMarketRef.current]);
        unsubscribe('trade', [prevMarketRef.current]);
        unsubscribe('orderbook', [prevMarketRef.current]);
      }
      
      // 상태 초기화
      setTicker(null);
      setTrades([]);
      setOrderbook(null);
      
      // 새로운 마켓 구독
      subscribe('ticker', [market]);
      subscribe('trade', [market]);
      subscribe('orderbook', [market]);
      
      // 현재 마켓 저장
      prevMarketRef.current = market;
    }

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      if (market) {
        unsubscribe('ticker', [market]);
        unsubscribe('trade', [market]);
        unsubscribe('orderbook', [market]);
      }
    };
  }, [market, subscribe, unsubscribe]);

  useEffect(() => {
    if (!lastMessage || !market) return;

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