import { useQuery } from '@tanstack/react-query';
import { trading } from '@/lib/api/trading';
import { formatNumber } from '@/lib/utils';
import type { TradingStrategy, TradingStats, TradingStrategyType } from '@/types/trading';

const STRATEGY_NAMES: Record<TradingStrategyType, string> = {
  'VOLATILITY_BREAKOUT': '변동성 돌파',
  'MOVING_AVERAGE': '이동평균선 교차',
  'RSI': 'RSI'
};

export function AutoTradingStatus() {
  // 전략 목록과 통계 데이터 조회
  const { data: strategies = [] } = useQuery({
    queryKey: ['trading', 'strategies'],
    queryFn: async () => {
      const response = await trading.getStrategies();
      return response.data;
    },
    refetchInterval: 5000
  });

  const { data: stats = [] } = useQuery({
    queryKey: ['trading', 'stats'],
    queryFn: async () => {
      if (!strategies.length) return [];
      const statsPromises = strategies.map(strategy => trading.getStats(strategy.id));
      const responses = await Promise.all(statsPromises);
      return responses.map(response => response.data);
    },
    enabled: strategies.length > 0,
    refetchInterval: 5000
  });

  // 전략과 통계 데이터 매핑
  const strategyStats = strategies.map(strategy => {
    const stat = stats.find(s => s.strategyId === strategy.id);
    return {
      ...strategy,
      stats: stat
    };
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-medium text-gray-900">자동매매 현황</h2>
      </div>
      <div className="p-4">
        {strategyStats.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            등록된 전략이 없습니다
          </div>
        ) : (
          <div className="space-y-4">
            {strategyStats.map(({ id, type, enabled, market, stats }) => (
              <div key={id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {STRATEGY_NAMES[type]} ({market})
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {enabled ? '실행 중' : '중지됨'}
                    </span>
                  </div>
                  {stats && (
                    <>
                      <div className="mt-1 text-sm text-gray-500">
                        총 {stats.totalTrades}회 거래
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        승률: {stats.totalTrades > 0 
                          ? ((stats.winCount / stats.totalTrades) * 100).toFixed(1) 
                          : 0}%
                        ({stats.winCount}/{stats.totalTrades})
                      </div>
                      {stats.lastTradeAt && (
                        <div className="mt-1 text-xs text-gray-500">
                          마지막 거래: {new Date(stats.lastTradeAt).toLocaleString()}
                        </div>
                      )}
                    </>
                  )}
                </div>
                {stats && (
                  <div className="text-right">
                    <div className={`font-medium ${
                      stats.totalProfit >= 0 ? 'text-[#d24f45]' : 'text-[#1261c4]'
                    }`}>
                      {stats.totalProfit >= 0 ? '+' : ''}{formatNumber(stats.totalProfit)}원
                    </div>
                    <div className={`text-sm ${
                      stats.todayProfit >= 0 ? 'text-[#d24f45]' : 'text-[#1261c4]'
                    }`}>
                      오늘: {stats.todayProfit >= 0 ? '+' : ''}{formatNumber(stats.todayProfit)}원
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      시작: {new Date(stats.startedAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 