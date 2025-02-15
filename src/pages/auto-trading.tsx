import { TradingBot } from '@/components/auto-trading/trading-bot';
import { TradingMonitor } from '@/components/auto-trading/trading-monitor';
import { TradingLog } from '@/components/auto-trading/trading-log';

export function AutoTrading() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-8">
        <TradingMonitor />
        <div className="mt-4">
          <TradingLog />
        </div>
      </div>
      <div className="col-span-4">
        <TradingBot />
      </div>
    </div>
  );
} 