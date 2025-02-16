from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

router = APIRouter(
    prefix="/api/trading/stats",
    tags=["8. Stats"]
)

class TradingStats(BaseModel):
    strategyId: str
    totalProfit: float = 0
    todayProfit: float = 0
    totalTrades: int = 0
    winCount: int = 0
    lossCount: int = 0
    startedAt: datetime = Field(default_factory=datetime.now)
    lastTradeAt: Optional[datetime] = None

    class Config:
        json_encoders = {
            datetime: lambda dt: int(dt.timestamp() * 1000)  # milliseconds timestamp
        }

# 임시 메모리 저장소
stats: dict[str, TradingStats] = {}

@router.get("/{strategy_id}", response_model=TradingStats)
async def get_stats(strategy_id: str):
    if strategy_id not in stats:
        # 전략이 있지만 통계가 없는 경우 기본값 반환
        stats[strategy_id] = TradingStats(
            strategyId=strategy_id,
            startedAt=datetime.now()
        )
    return stats[strategy_id]

@router.post("/{strategy_id}")
async def update_stats(strategy_id: str, profit: float):
    if strategy_id not in stats:
        stats[strategy_id] = TradingStats(
            strategyId=strategy_id,
            startedAt=datetime.now()
        )
    
    stat = stats[strategy_id]
    stat.totalProfit += profit
    stat.todayProfit += profit
    stat.totalTrades += 1
    stat.lastTradeAt = datetime.now()
    
    if profit > 0:
        stat.winCount += 1
    else:
        stat.lossCount += 1
    
    return {"message": "Stats updated"} 