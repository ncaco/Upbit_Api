from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime
import httpx
from app.api.exchage.market import get_candles
from app.api.trading.strategies import create_strategy, TradingStrategy
from app.api.upbit.client import UpbitClient
from app.api.trading.models import (
    BacktestTrade,
    MonthlyReturn,
    DailyReturn,
    TradePatterns,
    StrategyImprovement,
    BacktestResult,
    BacktestRequest
)

# 신호 계산 함수
def calculate_signal(strategy: TradingStrategy, candle: Dict) -> Optional[Dict]:
    """
    전략에 따른 매매 신호 계산
    
    Args:
        strategy: 거래 전략 객체
        candle: 현재 캔들 데이터
        
    Returns:
        Dict: 매수/매도 신호를 포함한 딕셔너리
        None: 신호가 없는 경우
    """
    if strategy.type == "VOLATILITY_BREAKOUT":
        return _calculate_volatility_breakout_signal(strategy, candle)
    elif strategy.type == "MOVING_AVERAGE":
        return _calculate_moving_average_signal(strategy, candle)
    elif strategy.type == "RSI":
        return _calculate_rsi_signal(strategy, candle)
    return None

def _calculate_volatility_breakout_signal(strategy: TradingStrategy, candle: Dict) -> Optional[Dict]:
    """변동성 돌파 전략 신호 계산"""
    k = strategy.params.get("k", 0.5)
    target_price = candle["opening_price"] + (candle["high_price"] - candle["low_price"]) * k
    
    # 매수 신호: 현재가가 목표가를 돌파
    if candle["trade_price"] >= target_price:
        return {"should_buy": True}
    
    # 매도 신호: 1% 이상 하락
    if candle["trade_price"] <= target_price * 0.99:
        return {"should_sell": True}
    
    return None

def _calculate_moving_average_signal(strategy: TradingStrategy, candle: Dict) -> Optional[Dict]:
    """이동평균 전략 신호 계산"""
    # TODO: 이동평균 계산 및 신호 생성 로직 구현
    return None

def _calculate_rsi_signal(strategy: TradingStrategy, candle: Dict) -> Optional[Dict]:
    """RSI 전략 신호 계산"""
    # TODO: RSI 계산 및 신호 생성 로직 구현
    return None

# 백테스터 클래스
class Backtester:
    def __init__(self, candles: List[Dict], strategy: TradingStrategy, initial_balance: float = 1000000):
        self.candles = candles
        self.strategy = strategy
        self.initial_balance = initial_balance
        self.position_size = 0.9  # 기본 포지션 크기 (90%)

    async def run(self) -> BacktestResult:
        result = BacktestResult()
        balance = self.initial_balance
        position = None
        trades = []
        
        # 최대 손실, 연속 손익 기록용
        current_streak = 0
        peak_balance = balance
        last_trade_time = None
        
        for i, candle in enumerate(self.candles):
            # 손절/익절 체크
            if position:
                current_profit_rate = (candle["trade_price"] / position["price"] - 1) * 100
                profit_target = self.strategy.params.get("profitTarget", 1.0)
                stop_loss = self.strategy.params.get("stopLoss", 1.0)
                
                # 손절/익절 조건 확인
                should_exit = (
                    current_profit_rate >= profit_target or  # 익절
                    current_profit_rate <= -stop_loss  # 손절
                )
                
                if should_exit:
                    # 매도 로직 실행
                    profit = (candle["trade_price"] - position["price"]) * position["volume"]
                    profit_rate = current_profit_rate
                    
                    balance += position["volume"] * candle["trade_price"]
                    result.totalProfit += profit
                    
                    # 거래 기록 추가
                    trade = BacktestTrade(
                        timestamp=candle["timestamp"],
                        type="SELL",
                        price=candle["trade_price"],
                        volume=position["volume"],
                        profit=profit,
                        profit_rate=profit_rate,
                        balance=balance,
                        cumulative_profit=result.totalProfit,
                        cumulative_profit_rate=(result.totalProfit / self.initial_balance) * 100
                    )
                    trades.append(trade)
                    
                    # 통계 업데이트
                    if profit > 0:
                        result.winCount += 1
                        current_streak = max(1, current_streak + 1)
                        result.winningStreak = max(result.winningStreak, current_streak)
                    else:
                        result.lossCount += 1
                        current_streak = min(-1, current_streak - 1)
                        result.losingStreak = min(result.losingStreak, current_streak)
                    
                    position = None
                    continue

            # 매매 신호 계산
            signal = calculate_signal(self.strategy, candle)
            
            if signal:
                if signal.get("should_buy") and not position:
                    # 최소 거래 간격 확인 (1분)
                    if last_trade_time and (candle["timestamp"] - last_trade_time) < 60000:
                        continue
                        
                    # 매수 가능 금액 계산 (수수료 고려)
                    available_balance = balance * self.position_size
                    fee = available_balance * 0.0005  # 0.05% 수수료
                    actual_balance = available_balance - fee
                    
                    # 매수 로직
                    volume = actual_balance / candle["trade_price"]
                    position = {
                        "price": candle["trade_price"],
                        "volume": volume,
                        "timestamp": candle["timestamp"]
                    }
                    balance -= (volume * candle["trade_price"]) * (1 + 0.0005)  # 수수료 포함
                    last_trade_time = candle["timestamp"]
                    
                    trade = BacktestTrade(
                        timestamp=candle["timestamp"],
                        type="BUY",
                        price=candle["trade_price"],
                        volume=volume,
                        balance=balance,
                        cumulative_profit=result.totalProfit,
                        cumulative_profit_rate=(result.totalProfit / self.initial_balance) * 100
                    )
                    trades.append(trade)
                    
                elif signal.get("should_sell") and position:
                    # 매도 로직
                    profit = (candle["trade_price"] - position["price"]) * position["volume"]
                    profit_rate = (candle["trade_price"] / position["price"] - 1) * 100
                    
                    # 수수료 고려
                    fee = (position["volume"] * candle["trade_price"]) * 0.0005
                    actual_profit = profit - fee
                    
                    balance += (position["volume"] * candle["trade_price"]) * (1 - 0.0005)  # 수수료 차감
                    result.totalProfit += actual_profit
                    last_trade_time = candle["timestamp"]
                    
                    trade = BacktestTrade(
                        timestamp=candle["timestamp"],
                        type="SELL",
                        price=candle["trade_price"],
                        volume=position["volume"],
                        profit=actual_profit,
                        profit_rate=profit_rate,
                        balance=balance,
                        cumulative_profit=result.totalProfit,
                        cumulative_profit_rate=(result.totalProfit / self.initial_balance) * 100
                    )
                    trades.append(trade)
                    
                    if actual_profit > 0:
                        result.winCount += 1
                        current_streak = max(1, current_streak + 1)
                        result.winningStreak = max(result.winningStreak, current_streak)
                    else:
                        result.lossCount += 1
                        current_streak = min(-1, current_streak - 1)
                        result.losingStreak = min(result.losingStreak, current_streak)
                    
                    position = None
            
            # 최대 잔고 및 낙폭 갱신
            if balance > peak_balance:
                peak_balance = balance
            else:
                drawdown = (peak_balance - balance) / peak_balance * 100
                result.maxDrawdown = max(result.maxDrawdown, drawdown)
        
        # 최종 포지션 청산
        if position:
            last_candle = self.candles[-1]
            profit = (last_candle["trade_price"] - position["price"]) * position["volume"]
            profit_rate = (last_candle["trade_price"] / position["price"] - 1) * 100
            fee = (position["volume"] * last_candle["trade_price"]) * 0.0005
            actual_profit = profit - fee
            
            balance += (position["volume"] * last_candle["trade_price"]) * (1 - 0.0005)
            result.totalProfit += actual_profit
            
            trade = BacktestTrade(
                timestamp=last_candle["timestamp"],
                type="SELL",
                price=last_candle["trade_price"],
                volume=position["volume"],
                profit=actual_profit,
                profit_rate=profit_rate,
                balance=balance,
                cumulative_profit=result.totalProfit,
                cumulative_profit_rate=(result.totalProfit / self.initial_balance) * 100
            )
            trades.append(trade)
        
        # 결과 통계 계산
        self._calculate_statistics(result, trades)
        
        return result

    def _calculate_statistics(self, result: BacktestResult, trades: List[BacktestTrade]):
        """거래 결과 통계 계산"""
        result.trades = trades
        result.totalTrades = len(trades)
        result.profitRate = (result.totalProfit / self.initial_balance) * 100
        
        if result.totalTrades > 0:
            result.winRate = (result.winCount / result.totalTrades) * 100
            
            profits = [t.profit for t in trades if t.profit and t.profit > 0]
            losses = [t.profit for t in trades if t.profit and t.profit < 0]
            
            if profits:
                result.averageProfit = sum(profits) / len(profits)
                result.maxProfit = max(profits)
            
            if losses:
                result.averageLoss = sum(losses) / len(losses)
                result.maxLoss = min(losses)
            
            if result.averageLoss != 0:
                result.profitFactor = abs(result.averageProfit / result.averageLoss)
            
            # 평균 보유 기간 계산
            holding_periods = []
            for i in range(0, len(trades), 2):
                if i + 1 < len(trades):
                    holding_period = (trades[i+1].timestamp - trades[i].timestamp) / (1000 * 60)  # 분 단위
                    holding_periods.append(holding_period)
            
            if holding_periods:
                result.averageHoldingPeriod = sum(holding_periods) / len(holding_periods)

# API 라우터
router = APIRouter(
    prefix="/api/trading/backtest",
    tags=["10. Backtest"]
)

@router.post("", response_model=BacktestResult)
async def run_backtest(request: BacktestRequest) -> BacktestResult:
    """백테스트 실행 엔드포인트"""
    try:
        # 기간에 따른 캔들 개수 설정
        candle_count = {
            "1M": 43200,   # 30일 * 24시간 * 60분
            "3M": 129600,  # 90일 * 24시간 * 60분
            "6M": 259200,  # 180일 * 24시간 * 60분
            "1Y": 525600   # 365일 * 24시간 * 60분
        }.get(request.period, 43200)
        
        # 캔들 데이터 조회
        client = UpbitClient()
        candles = await client.fetch_candles(
            market=request.strategy["market"],
            count=candle_count,
            unit="1"  # 1분봉 사용
        )
        
        # 전략 객체 생성
        strategy = TradingStrategy(
            market=request.strategy["market"],
            type=request.strategy["type"],
            params=request.strategy["params"]
        )
        
        # 백테스터 실행
        backtester = Backtester(
            candles=candles,
            strategy=strategy,
            initial_balance=request.initial_capital * 10000  # 만원 단위 변환
        )
        
        result = await backtester.run()
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Backtesting failed: {str(e)}"
        )

@router.get("/results/{strategy_id}", response_model=List[BacktestResult])
async def get_backtest_results(strategy_id: str):
    """
    특정 전략의 백테스트 결과 이력 조회
    """
    # TODO: 결과 이력 저장소 구현 필요
    return [] 