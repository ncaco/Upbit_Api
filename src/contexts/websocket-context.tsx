import { useEffect, useState, ReactNode } from 'react';
import { WebSocketMessage } from '@/types/websocket';
import { WebSocketManager } from '@/lib/websocket-manager';
import { createWebSocketContext } from './websocket-store';

const { WebSocketContext } = createWebSocketContext();

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  useEffect(() => {
    const wsManager = WebSocketManager.getInstance();

    wsManager.addStatusHandler(setStatus);
    wsManager.addMessageHandler(setLastMessage);
    wsManager.connect();

    return () => {
      wsManager.removeStatusHandler(setStatus);
      wsManager.removeMessageHandler(setLastMessage);
      wsManager.disconnect();
    };
  }, []);

  const subscribe = (type: 'ticker' | 'trade' | 'orderbook', codes: string[]) => {
    WebSocketManager.getInstance().subscribe(type, codes);
  };

  const unsubscribe = (type: 'ticker' | 'trade' | 'orderbook', codes: string[]) => {
    WebSocketManager.getInstance().unsubscribe(type, codes);
  };

  const connect = () => {
    WebSocketManager.getInstance().connect();
  };

  const disconnect = () => {
    WebSocketManager.getInstance().disconnect();
  };

  return (
    <WebSocketContext.Provider value={{ status, lastMessage, subscribe, unsubscribe, connect, disconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
} 