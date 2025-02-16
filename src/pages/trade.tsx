import { TradingBot } from '@/components/auto-trading/trading-bot';
import { TradingMonitor } from '@/components/auto-trading/trading-monitor';
import { TradingLog } from '@/components/auto-trading/trading-log';

export default function TradePage() {
  return (
    <div className="layout-container">
      {/* 자동매매 모니터링 */}
      <div className="grid-container grid-cols-1">
        <TradingMonitor />
      </div>

      {/* 자동매매 설정 및 로그 */}
      <div className="grid-container grid-cols-1 lg:grid-cols-2">
        <div className="space-y-6">
          <TradingBot />
        </div>
        <div className="space-y-6">
          <TradingLog />
        </div>
      </div>
    </div>
  );
} 