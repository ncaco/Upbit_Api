import { createContext, useContext, useCallback } from 'react';
import { WebSocketMessage } from '@/types/websocket';

interface WebSocketState {
  status: 'connecting' | 'connected' | 'disconnected';
  lastMessage: WebSocketMessage | null;
  lastError: Error | null;
  subscriptions: Array<{
    type: 'ticker' | 'trade' | 'orderbook';
    codes: string[];
  }>;
}

interface WebSocketContextType extends WebSocketState {
  subscribe: (type: 'ticker' | 'trade' | 'orderbook', codes: string[]) => void;
  unsubscribe: (type: 'ticker' | 'trade' | 'orderbook', codes: string[]) => void;
  connect: () => void;
  disconnect: () => void;
  clearError: () => void;
}

const initialState: WebSocketState = {
  status: 'disconnected',
  lastMessage: null,
  lastError: null,
  subscriptions: []
};

export function createWebSocketContext() {
  const WebSocketContext = createContext<WebSocketContextType>({
    ...initialState,
    subscribe: () => {},
    unsubscribe: () => {},
    connect: () => {},
    disconnect: () => {},
    clearError: () => {}
  });
  
  const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
      throw new Error('useWebSocket must be used within a WebSocketProvider');
    }

    const subscribeToMarket = useCallback((market: string) => {
      context.subscribe('ticker', [market]);
      context.subscribe('trade', [market]);
      context.subscribe('orderbook', [market]);
    }, [context]);

    const unsubscribeFromMarket = useCallback((market: string) => {
      context.unsubscribe('ticker', [market]);
      context.unsubscribe('trade', [market]);
      context.unsubscribe('orderbook', [market]);
    }, [context]);

    return {
      ...context,
      subscribeToMarket,
      unsubscribeFromMarket
    };
  };
  
  return { WebSocketContext, useWebSocket };
} 