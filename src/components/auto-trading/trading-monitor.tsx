import { Card } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

interface TradingStats {
  totalProfit: number;
  todayProfit: number;
  totalTrades: number;
  winRate: number;
  runningTime: string;
}

export function TradingMonitor() {
  const stats: TradingStats = {
    totalProfit: 1250000,
    todayProfit: 125000,
    totalTrades: 42,
    winRate: 68.5,
    runningTime: '2일 14시간 23분'
  };

  return (
    <Card className="p-4">
      <h2 className="text-lg font-bold mb-4">자동매매 모니터링</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">총 수익</div>
          <div className="text-xl font-bold text-green-500">
            +{formatNumber(stats.totalProfit)}원
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">오늘 수익</div>
          <div className="text-xl font-bold text-green-500">
            +{formatNumber(stats.todayProfit)}원
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">총 거래 횟수</div>
          <div className="text-xl font-bold">
            {stats.totalTrades}회
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">승률</div>
          <div className="text-xl font-bold">
            {stats.winRate}%
          </div>
        </div>
      </div>
      <div className="mt-4 p-3 bg-gray-50 rounded">
        <div className="text-sm text-gray-500">실행 시간</div>
        <div className="text-lg font-medium">
          {stats.runningTime}
        </div>
      </div>
    </Card>
  );
} 