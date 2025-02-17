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

class TradingStrategy:
    def __init__(self, market: str, type: str, params: dict):
        self.market = market
        self.type = type
        self.params = params

    @property
    def id(self) -> str:
        return f"{self.market}_{self.type}"

    @property
    def enabled(self) -> bool:
        return True

    def calculate_signal(self, candles: List[Dict]) -> Optional[Dict]:
        if len(candles) < 2:
            return None

        current_candle = candles[-1]
        
        if self.type == "VOLATILITY_BREAKOUT":
            return self._calculate_volatility_breakout_signal(candles)
        elif self.type == "MOVING_AVERAGE":
            return self._calculate_moving_average_signal(candles)
        elif self.type == "RSI":
            return self._calculate_rsi_signal(candles)
        
        return None

    def _calculate_volatility_breakout_signal(self, candles: List[Dict]) -> Optional[Dict]:
        if len(candles) < 2:
            return None

        current_candle = candles[-1]
        previous_candle = candles[-2]
        
        k = self.params.get("k", 0.5)
        target_price = previous_candle["opening_price"] + (previous_candle["high_price"] - previous_candle["low_price"]) * k
        
        return {
            "shouldBuy": current_candle["trade_price"] >= target_price,
            "shouldSell": current_candle["trade_price"] <= target_price * (1 - self.params.get("stopLoss", 0.02)),
            "targetPrice": target_price
        }

    def _calculate_moving_average_signal(self, candles: List[Dict]) -> Optional[Dict]:
        short_period = int(self.params.get("shortPeriod", 5))
        long_period = int(self.params.get("longPeriod", 20))
        
        if len(candles) < long_period:
            return None
            
        prices = [c["trade_price"] for c in candles]
        short_ma = sum(prices[-short_period:]) / short_period
        long_ma = sum(prices[-long_period:]) / long_period
        
        current_price = prices[-1]
        
        return {
            "shouldBuy": short_ma > long_ma,
            "shouldSell": short_ma < long_ma or current_price <= prices[-2] * (1 - self.params.get("stopLoss", 0.02)),
            "targetPrice": current_price
        }

    def _calculate_rsi_signal(self, candles: List[Dict]) -> Optional[Dict]:
        period = int(self.params.get("period", 14))
        oversold = self.params.get("oversold", 30)
        overbought = self.params.get("overbought", 70)
        
        if len(candles) < period + 1:
            return None
            
        prices = [c["trade_price"] for c in candles]
        gains = []
        losses = []
        
        for i in range(1, len(prices)):
            change = prices[i] - prices[i-1]
            if change >= 0:
                gains.append(change)
                losses.append(0)
            else:
                gains.append(0)
                losses.append(abs(change))
                
        avg_gain = sum(gains[-period:]) / period
        avg_loss = sum(losses[-period:]) / period
        
        if avg_loss == 0:
            rsi = 100
        else:
            rs = avg_gain / avg_loss
            rsi = 100 - (100 / (1 + rs))
            
        current_price = prices[-1]
        
        return {
            "shouldBuy": rsi <= oversold,
            "shouldSell": rsi >= overbought or current_price <= prices[-2] * (1 - self.params.get("stopLoss", 0.02)),
            "targetPrice": current_price
        }

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