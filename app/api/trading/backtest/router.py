from fastapi import APIRouter, HTTPException
from typing import List, Dict
import httpx
from app.api.exchage.market import get_candles
from app.api.trading.strategies import create_strategy, TradingStrategy
from app.api.trading.backtest.models import BacktestRequest, BacktestResult
from app.api.trading.backtest.backtester import Backtester
from app.api.upbit.client import UpbitClient

router = APIRouter(
    prefix="/api/trading/backtest",
    tags=["10. Backtest"]
)

# 백테스트 실행 엔드포인트
@router.post("/backtest", response_model=BacktestResult)
async def run_backtest(request: BacktestRequest) -> BacktestResult:
    """백테스트 실행 엔드포인트"""
    # 캔들 개수 제한 확인 (최대 90일)
    if request.candle_count > 129600:  # 90일 * 24시간 * 60분
        raise HTTPException(
            status_code=400,
            detail="Maximum candle count exceeded. Please request 90 days or less."
        )
    
    # 최소 캔들 개수 확인
    if request.candle_count < 100:
        raise HTTPException(
            status_code=400,
            detail="Minimum 100 candles required for backtesting."
        )
    
    try:
        # 캔들 데이터 조회
        client = UpbitClient()
        candles = await client.fetch_candles(
            market=request.market,
            count=request.candle_count,
            unit=request.candle_unit
        )
        
        # 전략 생성
        strategy = await TradingStrategy.create({
            "type": request.strategy.type,
            "params": request.strategy.params.model_dump(exclude_none=True)
        })
        
        # 백테스터 실행
        backtester = Backtester(
            candles=candles,
            strategy=strategy,
            initial_balance=request.initial_balance
        )
        
        result = await backtester.run()
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Backtesting failed: {str(e)}"
        )

# 백테스트 결과 조회 엔드포인트
@router.get("/results/{strategy_id}", response_model=List[BacktestResult])
async def get_backtest_results(strategy_id: str):
    """
    특정 전략의 백테스트 결과 이력 조회
    """
    # TODO: 결과 이력 저장소 구현 필요
    return [] 