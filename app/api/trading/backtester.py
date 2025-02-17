from typing import List, Dict, Tuple
from datetime import datetime
import numpy as np

class Backtester:
    def __init__(self, candles: List[Dict], strategy: TradingStrategy, initial_balance: float):
        self.candles = candles
        self.strategy = strategy
        self.initial_balance = initial_balance
        self.balance = initial_balance
        self.position = "NONE"
        self.trades: List[BacktestTrade] = []
        self.entry_price = 0.0

    async def run(self) -> BacktestResult:
        for i in range(len(self.candles) - 1):
            current_candle = self.candles[i]
            next_candle = self.candles[i + 1]
            
            signal = self.strategy.calculate_signal(self.candles[:i+1])
            if signal is None:
                continue
                
            if signal.shouldBuy and self.position == "NONE":
                # 매수
                self.position = "LONG"
                self.entry_price = next_candle["trade_price"]
                volume = self.balance / self.entry_price
                
                self.trades.append(BacktestTrade(
                    timestamp=next_candle["timestamp"],
                    type="BUY",
                    price=self.entry_price,
                    volume=volume,
                    balance=self.balance,
                    cumulativeProfit=0,
                    cumulativeProfitRate=0
                ))
                
            elif signal.shouldSell and self.position == "LONG":
                # 매도
                exit_price = next_candle["trade_price"]
                volume = self.balance / self.entry_price
                profit = (exit_price - self.entry_price) * volume
                profit_rate = (exit_price - self.entry_price) / self.entry_price * 100
                
                self.balance += profit
                self.position = "NONE"
                
                self.trades.append(BacktestTrade(
                    timestamp=next_candle["timestamp"],
                    type="SELL",
                    price=exit_price,
                    volume=volume,
                    profit=profit,
                    profitRate=profit_rate,
                    balance=self.balance,
                    cumulativeProfit=self.balance - self.initial_balance,
                    cumulativeProfitRate=(self.balance - self.initial_balance) / self.initial_balance * 100
                ))
        
        # 결과 계산
        win_trades = [t for t in self.trades if t.type == "SELL" and t.profit > 0]
        loss_trades = [t for t in self.trades if t.type == "SELL" and t.profit <= 0]
        
        total_profit = self.balance - self.initial_balance
        profit_rate = (self.balance - self.initial_balance) / self.initial_balance * 100
        
        return BacktestResult(
            trades=self.trades,
            totalTrades=len([t for t in self.trades if t.type == "SELL"]),
            winRate=len(win_trades) / (len(win_trades) + len(loss_trades)) if win_trades or loss_trades else 0,
            totalProfit=total_profit,
            profitRate=profit_rate,
            maxDrawdown=self._calculate_max_drawdown(),
            sharpeRatio=self._calculate_sharpe_ratio(),
            monthlyReturns=self._calculate_monthly_returns(),
            dailyReturns=self._calculate_daily_returns(),
            averageWinAmount=sum(t.profit for t in win_trades) / len(win_trades) if win_trades else 0,
            averageLossAmount=sum(t.profit for t in loss_trades) / len(loss_trades) if loss_trades else 0,
            largestWin=max((t.profit for t in win_trades), default=0),
            largestLoss=min((t.profit for t in loss_trades), default=0),
            profitFactor=self._calculate_profit_factor(),
            recoveryFactor=self._calculate_recovery_factor(),
            expectancy=self._calculate_expectancy(),
            tradePatterns=self._analyze_trade_patterns(),
            suggestions=self._generate_suggestions()
        )

    def _calculate_max_drawdown(self) -> float:
        peak = self.initial_balance
        max_drawdown = 0
        
        for trade in self.trades:
            if trade.balance > peak:
                peak = trade.balance
            drawdown = (peak - trade.balance) / peak * 100
            max_drawdown = max(max_drawdown, drawdown)
            
        return max_drawdown

    def _calculate_sharpe_ratio(self) -> float:
        if not self.trades:
            return 0
            
        daily_returns = []
        current_day = None
        day_trades = []
        
        for trade in self.trades:
            trade_day = datetime.fromtimestamp(trade.timestamp / 1000).date()
            
            if current_day != trade_day:
                if day_trades:
                    daily_return = (day_trades[-1].balance - day_trades[0].balance) / day_trades[0].balance
                    daily_returns.append(daily_return)
                current_day = trade_day
                day_trades = [trade]
            else:
                day_trades.append(trade)
                
        if not daily_returns:
            return 0
            
        return (np.mean(daily_returns) / np.std(daily_returns) if np.std(daily_returns) != 0 else 0) * np.sqrt(252)

    def _calculate_monthly_returns(self) -> List[MonthlyReturn]:
        monthly_trades: Dict[str, List[BacktestTrade]] = {}
        
        for trade in self.trades:
            month = datetime.fromtimestamp(trade.timestamp / 1000).strftime("%Y-%m")
            if month not in monthly_trades:
                monthly_trades[month] = []
            monthly_trades[month].append(trade)
            
        monthly_returns = []
        for month, trades in monthly_trades.items():
            if not trades:
                continue
                
            start_balance = trades[0].balance
            end_balance = trades[-1].balance
            profit = end_balance - start_balance
            profit_rate = (end_balance - start_balance) / start_balance * 100
            
            monthly_returns.append(MonthlyReturn(
                month=month,
                profit=profit,
                profitRate=profit_rate,
                trades=len([t for t in trades if t.type == "SELL"])
            ))
            
        return sorted(monthly_returns, key=lambda x: x.month)

    def _calculate_daily_returns(self) -> List[DailyReturn]:
        daily_trades: Dict[str, List[BacktestTrade]] = {}
        
        for trade in self.trades:
            date = datetime.fromtimestamp(trade.timestamp / 1000).strftime("%Y-%m-%d")
            if date not in daily_trades:
                daily_trades[date] = []
            daily_trades[date].append(trade)
            
        daily_returns = []
        for date, trades in daily_trades.items():
            if not trades:
                continue
                
            start_balance = trades[0].balance
            end_balance = trades[-1].balance
            profit = end_balance - start_balance
            profit_rate = (end_balance - start_balance) / start_balance * 100
            
            daily_returns.append(DailyReturn(
                date=date,
                profit=profit,
                profitRate=profit_rate,
                trades=len([t for t in trades if t.type == "SELL"])
            ))
            
        return sorted(daily_returns, key=lambda x: x.date)

    def _calculate_profit_factor(self) -> float:
        total_profit = sum(t.profit for t in self.trades if t.type == "SELL" and t.profit > 0)
        total_loss = abs(sum(t.profit for t in self.trades if t.type == "SELL" and t.profit < 0))
        return total_profit / total_loss if total_loss != 0 else 0

    def _calculate_recovery_factor(self) -> float:
        max_drawdown = self._calculate_max_drawdown()
        return abs(self.balance - self.initial_balance) / (max_drawdown * self.initial_balance / 100) if max_drawdown != 0 else 0

    def _calculate_expectancy(self) -> float:
        win_trades = [t for t in self.trades if t.type == "SELL" and t.profit > 0]
        loss_trades = [t for t in self.trades if t.type == "SELL" and t.profit <= 0]
        
        if not win_trades and not loss_trades:
            return 0
            
        win_rate = len(win_trades) / (len(win_trades) + len(loss_trades))
        avg_win = sum(t.profit for t in win_trades) / len(win_trades) if win_trades else 0
        avg_loss = sum(t.profit for t in loss_trades) / len(loss_trades) if loss_trades else 0
        
        return (win_rate * avg_win) - ((1 - win_rate) * abs(avg_loss))

    def _analyze_trade_patterns(self) -> TradePatterns:
        morning_trades = []
        afternoon_trades = []
        evening_trades = []
        night_trades = []
        
        for trade in self.trades:
            hour = datetime.fromtimestamp(trade.timestamp / 1000).hour
            
            if 9 <= hour < 12:
                morning_trades.append(trade)
            elif 12 <= hour < 15:
                afternoon_trades.append(trade)
            elif 15 <= hour < 18:
                evening_trades.append(trade)
            else:
                night_trades.append(trade)
                
        return TradePatterns(
            timeOfDay={
                "morning": len(morning_trades),
                "afternoon": len(afternoon_trades),
                "evening": len(evening_trades),
                "night": len(night_trades)
            },
            profitByTime={
                "morning": sum(t.profit for t in morning_trades if t.type == "SELL" and t.profit is not None),
                "afternoon": sum(t.profit for t in afternoon_trades if t.type == "SELL" and t.profit is not None),
                "evening": sum(t.profit for t in evening_trades if t.type == "SELL" and t.profit is not None),
                "night": sum(t.profit for t in night_trades if t.type == "SELL" and t.profit is not None)
            },
            consecutiveWins=self._get_max_consecutive_wins(),
            consecutiveLosses=self._get_max_consecutive_losses(),
            averageHoldingTime=self._calculate_average_holding_time(),
            volumeProfile=self._analyze_volume_profile()
        )

    def _get_max_consecutive_wins(self) -> int:
        max_streak = current_streak = 0
        for trade in self.trades:
            if trade.type == "SELL":
                if trade.profit > 0:
                    current_streak += 1
                    max_streak = max(max_streak, current_streak)
                else:
                    current_streak = 0
        return max_streak

    def _get_max_consecutive_losses(self) -> int:
        max_streak = current_streak = 0
        for trade in self.trades:
            if trade.type == "SELL":
                if trade.profit <= 0:
                    current_streak += 1
                    max_streak = max(max_streak, current_streak)
                else:
                    current_streak = 0
        return max_streak

    def _calculate_average_holding_time(self) -> Dict[str, float]:
        profitable_times = []
        unprofitable_times = []
        
        buy_time = None
        for trade in self.trades:
            if trade.type == "BUY":
                buy_time = trade.timestamp
            elif trade.type == "SELL" and buy_time is not None:
                holding_time = (trade.timestamp - buy_time) / (1000 * 60 * 60)  # hours
                if trade.profit > 0:
                    profitable_times.append(holding_time)
                else:
                    unprofitable_times.append(holding_time)
                buy_time = None
                
        return {
            "profitable": np.mean(profitable_times) if profitable_times else 0,
            "unprofitable": np.mean(unprofitable_times) if unprofitable_times else 0
        }

    def _analyze_volume_profile(self) -> Dict[str, int]:
        volumes = [t.volume for t in self.trades if t.type == "SELL"]
        if not volumes:
            return {"high": 0, "medium": 0, "low": 0}
            
        sorted_volumes = sorted(volumes)
        third = len(sorted_volumes) // 3
        
        return {
            "high": len([v for v in volumes if v >= sorted_volumes[-third]]),
            "medium": len([v for v in volumes if sorted_volumes[third] <= v < sorted_volumes[-third]]),
            "low": len([v for v in volumes if v < sorted_volumes[third]])
        }

    def _generate_suggestions(self) -> List[StrategyImprovement]:
        suggestions = []
        
        # 시간대별 성과 분석
        time_profits = self.tradePatterns.profitByTime
        worst_time = min(time_profits.items(), key=lambda x: x[1])[0]
        if time_profits[worst_time] < 0:
            suggestions.append(StrategyImprovement(
                type="TIME_RESTRICTION",
                description=f"Consider avoiding trades during {worst_time} hours",
                impact=abs(time_profits[worst_time])
            ))
            
        # 연속 손실 분석
        if self.tradePatterns.consecutiveLosses >= 3:
            suggestions.append(StrategyImprovement(
                type="CONSECUTIVE_LOSS",
                description=f"Add safety measures after {self.tradePatterns.consecutiveLosses} consecutive losses",
                impact=self.tradePatterns.consecutiveLosses
            ))
            
        # 보유 시간 분석
        holding_times = self.tradePatterns.averageHoldingTime
        if holding_times["unprofitable"] > holding_times["profitable"]:
            suggestions.append(StrategyImprovement(
                type="HOLDING_TIME",
                description="Consider implementing earlier exit rules for losing trades",
                impact=holding_times["unprofitable"] - holding_times["profitable"]
            ))
            
        return suggestions 