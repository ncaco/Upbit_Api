from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime
import uuid

router = APIRouter(
    prefix="/api/trading/strategies",
    tags=["9. Strategies"]
)

class TradingStrategyBase(BaseModel):
    type: str  # VOLATILITY_BREAKOUT, MOVING_AVERAGE, RSI
    market: str
    enabled: bool = False
    params: Dict[str, float] = {}

class TradingStrategy(TradingStrategyBase):
    id: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True

# 임시 메모리 저장소
strategies: Dict[str, TradingStrategy] = {}

@router.get("", response_model=List[TradingStrategy])
async def get_strategies():
    return list(strategies.values())

@router.post("", response_model=TradingStrategy)
async def create_strategy(strategy: TradingStrategyBase):
    strategy_id = str(uuid.uuid4())
    now = datetime.now()
    
    new_strategy = TradingStrategy(
        id=strategy_id,
        createdAt=now,
        updatedAt=now,
        **strategy.dict()
    )
    
    strategies[strategy_id] = new_strategy
    return new_strategy

@router.patch("/{strategy_id}", response_model=TradingStrategy)
async def update_strategy(strategy_id: str, strategy: TradingStrategyBase):
    if strategy_id not in strategies:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    existing = strategies[strategy_id]
    updated = TradingStrategy(
        id=strategy_id,
        createdAt=existing.createdAt,
        updatedAt=datetime.now(),
        **strategy.dict()
    )
    
    strategies[strategy_id] = updated
    return updated

@router.delete("/{strategy_id}")
async def delete_strategy(strategy_id: str):
    if strategy_id not in strategies:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    del strategies[strategy_id]
    return {"message": "Strategy deleted"}

@router.post("/{strategy_id}/start")
async def start_strategy(strategy_id: str):
    if strategy_id not in strategies:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    strategy = strategies[strategy_id]
    updated = TradingStrategy(
        **{**strategy.dict(), "enabled": True, "updatedAt": datetime.now()}
    )
    strategies[strategy_id] = updated
    return {"message": "Strategy started"}

@router.post("/{strategy_id}/stop")
async def stop_strategy(strategy_id: str):
    if strategy_id not in strategies:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    strategy = strategies[strategy_id]
    updated = TradingStrategy(
        **{**strategy.dict(), "enabled": False, "updatedAt": datetime.now()}
    )
    strategies[strategy_id] = updated
    return {"message": "Strategy stopped"} 