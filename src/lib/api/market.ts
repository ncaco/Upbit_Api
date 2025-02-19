import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/upbit';

export interface Market {
  market: string;
  korean_name: string;
  english_name: string;
}

export interface Ticker {
  market: string;
  trade_date: string;
  trade_time: string;
  trade_price: number;
  change: 'RISE' | 'EVEN' | 'FALL';
  change_rate: number;
  change_price: number;
  acc_trade_volume: number;
  acc_trade_price: number;
  acc_trade_volume_24h: number;
  acc_trade_price_24h: number;
  highest_52_week_price: number;
}

export interface Trade {
  market: string;
  trade_date_utc: string;
  trade_time_utc: string;
  timestamp: number;
  trade_price: number;
  trade_volume: number;
  prev_closing_price: number;
  change_price: number;
  ask_bid: 'ASK' | 'BID';
  sequential_id: number;
}

export const market = {
  getMarkets: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/market/all?isDetails=false`);
      console.log('Markets response:', response); // 디버깅용
      return response;
    } catch (error) {
      console.error('Markets fetch error:', error);
      throw error;
    }
  },
  
  getTicker: async (markets: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/ticker?markets=${markets}`);
      console.log('Ticker response:', response); // 디버깅용
      return response;
    } catch (error) {
      console.error('Ticker fetch error:', error);
      throw error;
    }
  },

  getTrades: async (market: string, count: number = 20) => {
    const response = await axios.get(`${BASE_URL}/trades/ticks`, {
      params: { market, count }
    });
    return response;
  },

  getCandles: async (market: string, unit: number = 1) => {
    const response = await axios.get(`${BASE_URL}/candles/minutes/${unit}`, {
      params: { market }
    });
    return response;
  }
}; 