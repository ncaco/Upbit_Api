from typing import List, Dict
from datetime import datetime
from app.api.trading.backtest.models import BacktestResult, BacktestTrade
from app.api.trading.strategies import TradingStrategy
from app.api.trading.backtest.signal_calculator import calculate_signal

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
                    result.total_profit += profit
                    
                    # 거래 기록 추가
                    trade = BacktestTrade(
                        timestamp=candle["timestamp"],
                        type="SELL",
                        price=candle["trade_price"],
                        volume=position["volume"],
                        profit=profit,
                        profit_rate=profit_rate,
                        balance=balance,
                        cumulative_profit=result.total_profit,
                        cumulative_profit_rate=(result.total_profit / self.initial_balance) * 100
                    )
                    trades.append(trade)
                    
                    # 통계 업데이트
                    if profit > 0:
                        result.win_count += 1
                        current_streak = max(1, current_streak + 1)
                        result.winning_streak = max(result.winning_streak, current_streak)
                    else:
                        result.loss_count += 1
                        current_streak = min(-1, current_streak - 1)
                        result.losing_streak = min(result.losing_streak, current_streak)
                    
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
                        cumulative_profit=result.total_profit,
                        cumulative_profit_rate=(result.total_profit / self.initial_balance) * 100
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
                    result.total_profit += actual_profit
                    last_trade_time = candle["timestamp"]
                    
                    trade = BacktestTrade(
                        timestamp=candle["timestamp"],
                        type="SELL",
                        price=candle["trade_price"],
                        volume=position["volume"],
                        profit=actual_profit,
                        profit_rate=profit_rate,
                        balance=balance,
                        cumulative_profit=result.total_profit,
                        cumulative_profit_rate=(result.total_profit / self.initial_balance) * 100
                    )
                    trades.append(trade)
                    
                    if actual_profit > 0:
                        result.win_count += 1
                        current_streak = max(1, current_streak + 1)
                        result.winning_streak = max(result.winning_streak, current_streak)
                    else:
                        result.loss_count += 1
                        current_streak = min(-1, current_streak - 1)
                        result.losing_streak = min(result.losing_streak, current_streak)
                    
                    position = None
            
            # 최대 잔고 및 낙폭 갱신
            if balance > peak_balance:
                peak_balance = balance
            else:
                drawdown = (peak_balance - balance) / peak_balance * 100
                result.max_drawdown = max(result.max_drawdown, drawdown)
        
        # 최종 포지션 청산
        if position:
            last_candle = self.candles[-1]
            profit = (last_candle["trade_price"] - position["price"]) * position["volume"]
            profit_rate = (last_candle["trade_price"] / position["price"] - 1) * 100
            fee = (position["volume"] * last_candle["trade_price"]) * 0.0005
            actual_profit = profit - fee
            
            balance += (position["volume"] * last_candle["trade_price"]) * (1 - 0.0005)
            result.total_profit += actual_profit
            
            trade = BacktestTrade(
                timestamp=last_candle["timestamp"],
                type="SELL",
                price=last_candle["trade_price"],
                volume=position["volume"],
                profit=actual_profit,
                profit_rate=profit_rate,
                balance=balance,
                cumulative_profit=result.total_profit,
                cumulative_profit_rate=(result.total_profit / self.initial_balance) * 100
            )
            trades.append(trade)
        
        # 결과 통계 계산
        self._calculate_statistics(result, trades)
        
        return result

    def _calculate_statistics(self, result: BacktestResult, trades: List[BacktestTrade]):
        """거래 결과 통계 계산"""
        result.trades = trades
        result.total_trades = len(trades)
        result.profit_rate = (result.total_profit / self.initial_balance) * 100
        
        if result.total_trades > 0:
            result.win_rate = (result.win_count / result.total_trades) * 100
            
            profits = [t.profit for t in trades if t.profit and t.profit > 0]
            losses = [t.profit for t in trades if t.profit and t.profit < 0]
            
            if profits:
                result.average_profit = sum(profits) / len(profits)
                result.max_profit = max(profits)
            
            if losses:
                result.average_loss = sum(losses) / len(losses)
                result.max_loss = min(losses)
            
            if result.average_loss != 0:
                result.profit_factor = abs(result.average_profit / result.average_loss)
            
            # 평균 보유 기간 계산
            holding_periods = []
            for i in range(0, len(trades), 2):
                if i + 1 < len(trades):
                    holding_period = (trades[i+1].timestamp - trades[i].timestamp) / (1000 * 60)  # 분 단위
                    holding_periods.append(holding_period)
            
            if holding_periods:
                result.average_holding_period = sum(holding_periods) / len(holding_periods)
            
            # 샤프 비율 계산
            self._calculate_sharpe_ratio(result, trades) 