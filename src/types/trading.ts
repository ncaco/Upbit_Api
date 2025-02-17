import type { Candle } from '@/lib/api/market';

export type TradingStrategyType = 'VOLATILITY_BREAKOUT' | 'MOVING_AVERAGE' | 'RSI';

export interface TradingStrategy {
  market: string;
  type: TradingStrategyType;
  params: VolatilityBreakoutParams | MovingAverageParams | RSIParams;
  id?: string;
  enabled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TradingStats {
  strategyId: string;
  totalProfit: number;
  todayProfit: number;
  totalTrades: number;
  winCount: number;
  lossCount: number;
  startedAt: number;  // timestamp in milliseconds
  lastTradeAt: number | null;  // timestamp in milliseconds
}

export interface TradingLog {
  id: string;
  strategyId: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  message: string;
  data?: Record<string, unknown>;
  createdAt: Date;
}

export interface TradeHistory {
  id: string;
  strategyId: string;
  market: string;
  side: 'BUY' | 'SELL';
  price: number;
  volume: number;
  profit?: number;
  profitRate?: number;
  createdAt: Date;
}

// 전략별 파라미터 타입
export interface VolatilityBreakoutParams {
  k: number;              // 변동성 계수
  period: number;         // 변동성 계산 기간
  profitTarget: number;   // 익절 목표 %
  stopLoss: number;       // 손절 라인 %
}

export interface MovingAverageParams {
  shortPeriod: number;    // 단기 이동평균 기간
  longPeriod: number;     // 장기 이동평균 기간
  profitTarget: number;   // 익절 목표 %
  stopLoss: number;       // 손절 라인 %
}

export interface RSIParams {
  period: number;         // RSI 계산 기간
  oversold: number;       // 과매도 기준
  overbought: number;     // 과매수 기준
  profitTarget: number;   // 익절 목표 %
  stopLoss: number;       // 손절 라인 %
}

export interface BacktestTrade {
  timestamp: number;
  type: 'BUY' | 'SELL';
  price: number;
  volume: number;
  profit?: number;
  profitRate?: number;
  balance: number;
  cumulativeProfit: number;
  cumulativeProfitRate: number;
}

export interface MonthlyReturn {
  month: string;
  profit: number;
  profitRate: number;
  trades: number;
}

export interface DailyReturn {
  date: string;
  profit: number;
  profitRate: number;
  trades: number;
}

export interface TradePatterns {
  timeOfDay: {
    morning: number;   // 09:00-12:00
    afternoon: number; // 12:00-15:00
    evening: number;   // 15:00-18:00
    night: number;     // 18:00-09:00
  };
  profitByTime: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  consecutiveWins: number;
  consecutiveLosses: number;
  averageHoldingTime: {
    profitable: number;
    unprofitable: number;
  };
  volumeProfile: {
    high: number;    // 상위 33%
    medium: number;  // 중간 33%
    low: number;     // 하위 33%
  };
}

export type StrategyImprovementType = 
  | 'TIME_RESTRICTION'
  | 'VOLUME_FILTER'
  | 'HOLDING_TIME'
  | 'CONSECUTIVE_LOSS'
  | 'VOLATILITY';

export interface StrategyImprovement {
  type: StrategyImprovementType;
  description: string;
  impact: number;
}

export interface BacktestResult {
  trades: BacktestTrade[];
  totalTrades: number;
  winRate: number;
  totalProfit: number;
  profitRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  monthlyReturns: MonthlyReturn[];
  dailyReturns: DailyReturn[];
  averageWinAmount: number;
  averageLossAmount: number;
  largestWin: number;
  largestLoss: number;
  profitFactor: number;  // 총 이익 / 총 손실
  recoveryFactor: number;  // 총 이익 / 최대 손실폭
  expectancy: number;  // (승률 * 평균 이익) - ((1 - 승률) * 평균 손실)
  tradePatterns: TradePatterns;
  suggestions: StrategyImprovement[];
}

export interface BacktestRequest {
  strategy: {
    market: string;
    type: TradingStrategyType;
    params: VolatilityBreakoutParams | MovingAverageParams | RSIParams;
  };
  period: string;  // "1M" | "3M" | "6M" | "1Y"
  initial_capital: number;  // 만원 단위
} 