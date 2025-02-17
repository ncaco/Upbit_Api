from typing import List, Dict, Optional
from pydantic import BaseModel
from datetime import datetime

class BacktestTrade(BaseModel):
    timestamp: int
    type: str  # "BUY" | "SELL"
    price: float
    volume: float
    profit: Optional[float] = None
    profitRate: Optional[float] = None
    balance: float
    cumulativeProfit: float
    cumulativeProfitRate: float

class MonthlyReturn(BaseModel):
    month: str
    profit: float
    profitRate: float
    trades: int

class DailyReturn(BaseModel):
    date: str
    profit: float
    profitRate: float
    trades: int

class TradePatterns(BaseModel):
    timeOfDay: Dict[str, int]
    profitByTime: Dict[str, float]
    consecutiveWins: int
    consecutiveLosses: int
    averageHoldingTime: Dict[str, float]
    volumeProfile: Dict[str, int]

class StrategyImprovement(BaseModel):
    type: str
    description: str
    impact: float

class BacktestResult(BaseModel):
    trades: List[BacktestTrade]
    totalTrades: int
    winRate: float
    totalProfit: float
    profitRate: float
    maxDrawdown: float
    sharpeRatio: float
    monthlyReturns: List[MonthlyReturn]
    dailyReturns: List[DailyReturn]
    averageWinAmount: float
    averageLossAmount: float
    largestWin: float
    largestLoss: float
    profitFactor: float
    recoveryFactor: float
    expectancy: float
    tradePatterns: TradePatterns
    suggestions: List[StrategyImprovement]

class BacktestRequest(BaseModel):
    strategy: Dict
    period: str  # "1M" | "3M" | "6M" | "1Y"
    initial_capital: float  # 만원 단위 