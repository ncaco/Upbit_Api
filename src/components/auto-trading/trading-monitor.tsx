import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import { trading } from '@/lib/api/trading';
import type { TradingStats } from '@/types/trading';

interface TotalStats {
  totalProfit: number;
  todayProfit: number;
  totalTrades: number;
  winCount: number;
  lossCount: number;
}

export function TradingMonitor() {
  const { data: strategies = [] } = useQuery({
    queryKey: ['trading', 'strategies'],
    queryFn: async () => {
      const response = await trading.getStrategies();
      return response.data;
    }
  });

  const { data: statsMap = {} } = useQuery({
    queryKey: ['trading', 'stats'],
    queryFn: async () => {
      const statsPromises = strategies.map(strategy => 
        trading.getStats(strategy.id)
          .then(response => [strategy.id, response.data] as [string, TradingStats])
      );
      const statsEntries = await Promise.all(statsPromises);
      return Object.fromEntries(statsEntries) as Record<string, TradingStats>;
    },
    enabled: strategies.length > 0,
    refetchInterval: 5000
  });

  // 전체 통계 계산
  const totalStats = Object.values(statsMap).reduce((acc: TotalStats, stats: TradingStats) => ({
    totalProfit: acc.totalProfit + stats.totalProfit,
    todayProfit: acc.todayProfit + stats.todayProfit,
    totalTrades: acc.totalTrades + stats.totalTrades,
    winCount: acc.winCount + stats.winCount,
    lossCount: acc.lossCount + stats.lossCount
  }), {
    totalProfit: 0,
    todayProfit: 0,
    totalTrades: 0,
    winCount: 0,
    lossCount: 0
  });

  const winRate = totalStats.totalTrades > 0
    ? (totalStats.winCount / totalStats.totalTrades) * 100
    : 0;

  // 가장 오래 실행 중인 전략 찾기
  const oldestStartTime = Object.values(statsMap).reduce((oldest: number | null, stats: TradingStats) => {
    return oldest ? Math.min(oldest, stats.startedAt) : stats.startedAt;
  }, null);

  // 실행 시간 계산
  const getRunningTime = (startTimestamp: number) => {
    const diff = new Date().getTime() - startTimestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}일 ${hours}시간 ${minutes}분`;
  };

  return (
    <Card className="p-4">
      <h2 className="text-lg font-bold mb-4">자동매매 모니터링</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">총 수익</div>
          <div className={`text-xl font-bold ${
            totalStats.totalProfit >= 0 ? 'text-[#d24f45]' : 'text-[#1261c4]'
          }`}>
            {totalStats.totalProfit >= 0 ? '+' : ''}
            {formatNumber(totalStats.totalProfit)}원
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">오늘 수익</div>
          <div className={`text-xl font-bold ${
            totalStats.todayProfit >= 0 ? 'text-[#d24f45]' : 'text-[#1261c4]'
          }`}>
            {totalStats.todayProfit >= 0 ? '+' : ''}
            {formatNumber(totalStats.todayProfit)}원
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">총 거래 횟수</div>
          <div className="text-xl font-bold">
            {totalStats.totalTrades}회
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">승률</div>
          <div className="text-xl font-bold">
            {winRate.toFixed(1)}%
          </div>
        </div>
      </div>
      {oldestStartTime && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">실행 시간</div>
          <div className="text-lg font-medium">
            {getRunningTime(oldestStartTime)}
          </div>
        </div>
      )}
    </Card>
  );
} 