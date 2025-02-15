import { createContext, useContext } from 'react';
import { WebSocketMessage } from '@/types/websocket';

interface WebSocketContextType {
  status: 'connecting' | 'connected' | 'disconnected';
  lastMessage: WebSocketMessage | null;
  subscribe: (type: 'ticker' | 'trade' | 'orderbook', codes: string[]) => void;
  unsubscribe: (type: 'ticker' | 'trade' | 'orderbook', codes: string[]) => void;
  connect: () => void;
  disconnect: () => void;
}

export function createWebSocketContext() {
  const WebSocketContext = createContext<WebSocketContextType>({
    status: 'disconnected',
    lastMessage: null,
    subscribe: () => {},
    unsubscribe: () => {},
    connect: () => {},
    disconnect: () => {},
  });
  
  const useWebSocket = () => useContext(WebSocketContext);
  
  return { WebSocketContext, useWebSocket };
} 