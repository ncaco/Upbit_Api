export interface PerformanceMetrics {
  totalProfit: number;          // 총 수익
  totalTrades: number;          // 총 거래 횟수
  winCount: number;             // 승리 횟수
  lossCount: number;            // 패배 횟수
  winRate: number;              // 승률 (%)
  averageProfit: number;        // 평균 수익
  averageLoss: number;          // 평균 손실
  profitFactor: number;         // 수익 팩터
  maxDrawdown: number;          // 최대 낙폭 (%)
  sharpeRatio: number;          // 샤프 비율
  volatility: number;           // 변동성 (%)
  recoveryFactor: number;       // 회복 팩터
}

export interface StrategyPerformance {
  strategyId: string;
  strategyType: string;
  metrics: PerformanceMetrics;
  dailyReturns: Array<{
    date: string;
    return: number;
  }>;
  monthlyReturns: Array<{
    month: string;
    return: number;
  }>;
  trades: Array<{
    timestamp: number;
    type: 'BUY' | 'SELL';
    price: number;
    volume: number;
    profit?: number;
    profitRate?: number;
  }>;
}

export interface RiskMetrics {
  valueAtRisk: number;         // VaR (Value at Risk)
  expectedShortfall: number;   // ES (Expected Shortfall)
  beta: number;                // 베타
  correlation: number;         // 상관계수
  informationRatio: number;    // 정보 비율
  sortinoRatio: number;        // 소르티노 비율
  treynorRatio: number;        // 트레이너 비율
  calmarRatio: number;         // 칼마 비율
} 