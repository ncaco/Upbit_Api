export interface WebSocketTickerMessage {
  type: 'ticker';
  code: string;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  prev_closing_price: number;
  acc_trade_volume: number;
  acc_trade_price: number;
  timestamp: number;
  acc_trade_volume_24h: number;
  acc_trade_price_24h: number;
  change: 'RISE' | 'EVEN' | 'FALL';
  change_price: number;
  change_rate: number;
  signed_change_price: number;
  signed_change_rate: number;
}

export interface WebSocketTradeMessage {
  type: 'trade';
  code: string;
  trade_price: number;
  trade_volume: number;
  ask_bid: 'ASK' | 'BID';
  prev_closing_price: number;
  change: 'RISE' | 'EVEN' | 'FALL';
  change_price: number;
  trade_timestamp: number;
  timestamp: number;
  sequential_id: number;
  stream_type: 'REALTIME' | 'SNAPSHOT';
}

export interface WebSocketOrderbookMessage {
  type: 'orderbook';
  code: string;
  orderbook_units: Array<{
    ask_price: number;
    bid_price: number;
    ask_size: number;
    bid_size: number;
  }>;
  timestamp: number;
}

export type WebSocketMessage = WebSocketTickerMessage | WebSocketTradeMessage | WebSocketOrderbookMessage; 