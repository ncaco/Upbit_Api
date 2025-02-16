from pydantic import BaseModel
from typing import List, Dict, Optional

class StrategyParams(BaseModel):
    k: Optional[float] = None
    period: Optional[int] = None
    profitTarget: Optional[float] = None
    stopLoss: Optional[float] = None
    shortPeriod: Optional[int] = None
    longPeriod: Optional[int] = None
    oversold: Optional[float] = None
    overbought: Optional[float] = None

class Strategy(BaseModel):
    type: str
    market: str
    params: StrategyParams

class BacktestRequest(BaseModel):
    strategy: Strategy
    period: str
    initialCapital: float

class BacktestTrade(BaseModel):
    timestamp: int
    type: str  # 'BUY' | 'SELL'
    price: float
    volume: float
    profit: Optional[float] = None
    profit_rate: Optional[float] = None
    balance: float
    cumulative_profit: float
    cumulative_profit_rate: float

class BacktestResult(BaseModel):
    # 기본 통계
    total_trades: int = 0
    win_count: int = 0
    loss_count: int = 0
    win_rate: float = 0.0
    total_profit: float = 0.0
    profit_rate: float = 0.0
    
    # 수익성 지표
    average_profit: float = 0.0
    average_loss: float = 0.0
    profit_factor: float = 0.0
    max_profit: float = 0.0
    max_loss: float = 0.0
    
    # 리스크 지표
    max_drawdown: float = 0.0
    max_drawdown_period: int = 0
    recovery_factor: float = 0.0
    sharpe_ratio: float = 0.0
    
    # 거래 지표
    average_holding_period: float = 0.0
    winning_streak: int = 0
    losing_streak: int = 0
    
    # 거래 내역
    trades: List[BacktestTrade] = []
    
    # 월별/일별 수익률
    monthly_returns: List[Dict[str, float]] = []
    daily_returns: List[Dict[str, float]] = [] 