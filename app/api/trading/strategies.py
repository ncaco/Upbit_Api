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

class TradingStrategyResponse(BaseModel):
    id: str
    type: str
    market: str
    enabled: bool
    params: Dict[str, float]
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

class TradingStrategy:
    def __init__(self, market: str, type: str, params: dict):
        self.market = market
        self.type = type
        self.params = params
        self._id = f"{market}_{type}"
        self._enabled = True
        self._created_at = datetime.now()
        self._updated_at = datetime.now()

    @property
    def id(self) -> str:
        return self._id

    @property
    def enabled(self) -> bool:
        return self._enabled

    @property
    def created_at(self) -> datetime:
        return self._created_at

    @property
    def updated_at(self) -> datetime:
        return self._updated_at

    def to_response(self) -> TradingStrategyResponse:
        return TradingStrategyResponse(
            id=self.id,
            type=self.type,
            market=self.market,
            enabled=self.enabled,
            params=self.params,
            createdAt=self.created_at,
            updatedAt=self.updated_at
        )

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

@router.get("", response_model=List[TradingStrategyResponse])
async def get_strategies():
    return [strategy.to_response() for strategy in strategies.values()]

@router.post("", response_model=TradingStrategyResponse)
async def create_strategy(strategy: TradingStrategyBase):
    new_strategy = TradingStrategy(
        market=strategy.market,
        type=strategy.type,
        params=strategy.params
    )
    strategies[new_strategy.id] = new_strategy
    return new_strategy.to_response()

@router.patch("/{strategy_id}", response_model=TradingStrategyResponse)
async def update_strategy(strategy_id: str, strategy: TradingStrategyBase):
    if strategy_id not in strategies:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    updated = TradingStrategy(
        market=strategy.market,
        type=strategy.type,
        params=strategy.params
    )
    strategies[strategy_id] = updated
    return updated.to_response()

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
    strategy._enabled = True
    strategy._updated_at = datetime.now()
    return {"message": "Strategy started"}

@router.post("/{strategy_id}/stop")
async def stop_strategy(strategy_id: str):
    if strategy_id not in strategies:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    strategy = strategies[strategy_id]
    strategy._enabled = False
    strategy._updated_at = datetime.now()
    return {"message": "Strategy stopped"} 