import { useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
  type: string;
  code: string;
  trade_price: number;
  trade_volume: number;
  timestamp: number;
}

export function useUpbitWebSocket(markets: string[]) {
  const ws = useRef<WebSocket | null>(null);
  const [data, setData] = useState<WebSocketMessage | null>(null);

  useEffect(() => {
    // 웹소켓 연결
    ws.current = new WebSocket('wss://api.upbit.com/websocket/v1');

    ws.current.onopen = () => {
      if (ws.current?.readyState === 1) {
        ws.current.send(JSON.stringify([
          { ticket: "UNIQUE_TICKET" },
          { type: "trade", codes: markets },
          { format: "SIMPLE" }
        ]));
      }
    };

    ws.current.onmessage = (event) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const data = JSON.parse(reader.result);
          setData(data);
        }
      };
      reader.readAsText(event.data);
    };

    // Clean up
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [markets]);

  return data;
} 