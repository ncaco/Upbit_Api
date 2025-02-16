import { useEffect, useState } from 'react';
import { WebSocketManager } from '@/lib/websocket-manager';
import { WebSocketMessage } from '@/types/websocket';

export function useWebSocket() {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  useEffect(() => {
    const wsManager = WebSocketManager.getInstance();
    
    // 상태 핸들러 등록
    wsManager.addStatusHandler(setStatus);
    wsManager.addMessageHandler(setLastMessage);

    // 초기 연결 시도
    wsManager.connect();

    // 컴포넌트 언마운트 시 정리
    return () => {
      wsManager.removeStatusHandler(setStatus);
      wsManager.removeMessageHandler(setLastMessage);
    };
  }, []);

  const subscribe = (type: 'ticker' | 'trade' | 'orderbook', codes: string[]) => {
    WebSocketManager.getInstance().subscribe(type, codes);
  };

  const unsubscribe = (type: 'ticker' | 'trade' | 'orderbook', codes: string[]) => {
    WebSocketManager.getInstance().unsubscribe(type, codes);
  };

  return {
    status,
    lastMessage,
    subscribe,
    unsubscribe
  };
} 