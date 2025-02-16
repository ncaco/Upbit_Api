import { useEffect, useState, ReactNode } from 'react';
import { WebSocketMessage } from '@/types/websocket';
import { WebSocketManager } from '@/lib/websocket-manager';
import { createWebSocketContext } from './websocket-store';

const { WebSocketContext } = createWebSocketContext();

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [subscriptions, setSubscriptions] = useState<Array<{
    type: 'ticker' | 'trade' | 'orderbook';
    codes: string[];
  }>>([]);

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
    setSubscriptions(prev => {
      const existingSubscription = prev.find(sub => sub.type === type);
      if (existingSubscription) {
        return prev.map(sub => 
          sub.type === type 
            ? { ...sub, codes: [...new Set([...sub.codes, ...codes])] }
            : sub
        );
      }
      return [...prev, { type, codes }];
    });
  };

  const unsubscribe = (type: 'ticker' | 'trade' | 'orderbook', codes: string[]) => {
    WebSocketManager.getInstance().unsubscribe(type, codes);
    setSubscriptions(prev => {
      const updatedSubscriptions = prev.map(sub => {
        if (sub.type === type) {
          const remainingCodes = sub.codes.filter(code => !codes.includes(code));
          return { ...sub, codes: remainingCodes };
        }
        return sub;
      });
      return updatedSubscriptions.filter(sub => sub.codes.length > 0);
    });
  };

  const connect = () => {
    WebSocketManager.getInstance().connect();
  };

  const disconnect = () => {
    WebSocketManager.getInstance().disconnect();
    setSubscriptions([]);
  };

  const clearError = () => {
    setLastError(null);
  };

  return (
    <WebSocketContext.Provider 
      value={{ 
        status, 
        lastMessage, 
        lastError,
        subscriptions,
        subscribe, 
        unsubscribe, 
        connect, 
        disconnect,
        clearError
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
} 