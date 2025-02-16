import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import { performanceAnalyzer } from '@/lib/performance/performance-analyzer';
import type { PerformanceMetrics, RiskMetrics } from '@/types/performance';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface PerformanceMonitorProps {
  trades: Array<{
    timestamp: number;
    type: 'BUY' | 'SELL';
    price: number;
    volume: number;
    profit?: number;
    profitRate?: number;
  }>;
  benchmarkReturns: number[];
}

export function PerformanceMonitor({ trades, benchmarkReturns }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'returns' | 'risk'>('overview');

  // 성과 지표 계산
  useEffect(() => {
    const calculatedMetrics = performanceAnalyzer.calculateMetrics(trades);
    setMetrics(calculatedMetrics);

    const returns = performanceAnalyzer.calculateDailyReturns(trades);
    const calculatedRiskMetrics = performanceAnalyzer.calculateRiskMetrics(
      returns,
      benchmarkReturns
    );
    setRiskMetrics(calculatedRiskMetrics);
  }, [trades, benchmarkReturns]);

  if (!metrics || !riskMetrics) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // 일별 수익률 데이터
  const dailyReturnsData = trades
    .filter(t => t.profit !== undefined)
    .map(trade => ({
      date: new Date(trade.timestamp).toLocaleDateString(),
      return: trade.profitRate || 0
    }));

  // 누적 수익률 데이터
  const cumulativeReturnsData = trades
    .filter(t => t.profit !== undefined)
    .reduce((acc, trade) => {
      const date = new Date(trade.timestamp).toLocaleDateString();
      const lastValue = acc.length > 0 ? acc[acc.length - 1].value : 0;
      return [...acc, {
        date,
        value: lastValue + (trade.profit || 0)
      }];
    }, [] as Array<{ date: string; value: number }>);

  return (
    <Card className="p-4">
      <div className="space-y-6">
        {/* 탭 메뉴 */}
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`pb-2 px-4 ${
              selectedTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500'
            }`}
          >
            개요
          </button>
          <button
            onClick={() => setSelectedTab('returns')}
            className={`pb-2 px-4 ${
              selectedTab === 'returns'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500'
            }`}
          >
            수익률 분석
          </button>
          <button
            onClick={() => setSelectedTab('risk')}
            className={`pb-2 px-4 ${
              selectedTab === 'risk'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500'
            }`}
          >
            리스크 분석
          </button>
        </div>

        {/* 개요 */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* 주요 지표 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">총 수익</div>
                <div className={`text-xl font-bold ${
                  metrics.totalProfit >= 0 ? 'text-[#d24f45]' : 'text-[#1261c4]'
                }`}>
                  {formatNumber(metrics.totalProfit)}원
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">총 거래 횟수</div>
                <div className="text-xl font-bold">
                  {metrics.totalTrades}회
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">승률</div>
                <div className="text-xl font-bold">
                  {metrics.winRate.toFixed(1)}%
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">평균 수익</div>
                <div className="text-xl font-bold text-[#d24f45]">
                  {formatNumber(metrics.averageProfit)}원
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">평균 손실</div>
                <div className="text-xl font-bold text-[#1261c4]">
                  {formatNumber(metrics.averageLoss)}원
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">수익 팩터</div>
                <div className="text-xl font-bold">
                  {metrics.profitFactor.toFixed(2)}
                </div>
              </div>
            </div>

            {/* 누적 수익 차트 */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cumulativeReturnsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="누적 수익"
                    stroke="#8884d8"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 수익률 분석 */}
        {selectedTab === 'returns' && (
          <div className="space-y-6">
            {/* 수익률 지표 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">변동성</div>
                <div className="text-xl font-bold">
                  {metrics.volatility.toFixed(2)}%
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">샤프 비율</div>
                <div className="text-xl font-bold">
                  {metrics.sharpeRatio.toFixed(2)}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">회복 팩터</div>
                <div className="text-xl font-bold">
                  {metrics.recoveryFactor.toFixed(2)}
                </div>
              </div>
            </div>

            {/* 일별 수익률 차트 */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyReturnsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="return"
                    name="일별 수익률"
                    fill="#8884d8"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 리스크 분석 */}
        {selectedTab === 'risk' && (
          <div className="space-y-6">
            {/* 리스크 지표 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">VaR (95%)</div>
                <div className="text-xl font-bold">
                  {riskMetrics.valueAtRisk.toFixed(2)}%
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">Expected Shortfall</div>
                <div className="text-xl font-bold">
                  {riskMetrics.expectedShortfall.toFixed(2)}%
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">베타</div>
                <div className="text-xl font-bold">
                  {riskMetrics.beta.toFixed(2)}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">상관계수</div>
                <div className="text-xl font-bold">
                  {riskMetrics.correlation.toFixed(2)}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">Information Ratio</div>
                <div className="text-xl font-bold">
                  {riskMetrics.informationRatio.toFixed(2)}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">Sortino Ratio</div>
                <div className="text-xl font-bold">
                  {riskMetrics.sortinoRatio.toFixed(2)}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">Treynor Ratio</div>
                <div className="text-xl font-bold">
                  {riskMetrics.treynorRatio.toFixed(2)}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">Calmar Ratio</div>
                <div className="text-xl font-bold">
                  {riskMetrics.calmarRatio.toFixed(2)}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">최대 낙폭</div>
                <div className="text-xl font-bold text-red-500">
                  {metrics.maxDrawdown.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 