export interface RiskManagementConfig {
  maxDailyLoss: number;          // 일일 최대 손실 금액
  maxPositionSize: number;       // 최대 포지션 크기 (%)
  maxDailyTrades: number;        // 일일 최대 거래 횟수
  maxDrawdown: number;           // 최대 낙폭 (%)
  stopTradingOnMaxLoss: boolean; // 최대 손실 도달 시 거래 중지
}

export interface RiskStatus {
  dailyLoss: number;            // 당일 손실 금액
  dailyTradeCount: number;      // 당일 거래 횟수
  currentDrawdown: number;      // 현재 낙폭 (%)
  isTradingAllowed: boolean;    // 거래 가능 여부
  stopReason?: string;          // 거래 중지 사유
}

export interface PositionSizing {
  availableBalance: number;     // 사용 가능 잔고
  maxPositionAmount: number;    // 최대 포지션 금액
  suggestedAmount: number;      // 추천 매수/매도 금액
  currentRisk: number;          // 현재 리스크 (%)
} 