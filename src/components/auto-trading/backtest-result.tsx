import { formatNumber } from '@/lib/utils';
import { Card } from '@/components/ui/card';
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
import type { BacktestResult } from '@/types/trading';

interface BacktestResultProps {
  result: BacktestResult;
  initialCapital: number;
}

export function BacktestResult({ result, initialCapital }: BacktestResultProps) {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-medium mb-4">백테스트 결과</h2>
      
      {/* 주요 지표 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">수익성 지표</h3>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-500">총 수익:</span>{' '}
              <span className={`font-medium ${
                result.totalProfit > 0 ? 'text-red-500' : 'text-blue-500'
              }`}>
                {Math.round(result.totalProfit / 10000).toLocaleString()}만원
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">수익률:</span>{' '}
              <span className={`font-medium ${
                result.profitRate > 0 ? 'text-red-500' : 'text-blue-500'
              }`}>
                {result.profitRate.toFixed(2)}%
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Profit Factor:</span>{' '}
              <span className="font-medium">
                {result.profitFactor === Infinity ? '∞' : result.profitFactor.toFixed(2)}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Recovery Factor:</span>{' '}
              <span className="font-medium">
                {result.recoveryFactor === Infinity ? '∞' : result.recoveryFactor.toFixed(2)}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Expectancy:</span>{' '}
              <span className={`font-medium ${
                result.expectancy > 0 ? 'text-red-500' : 'text-blue-500'
              }`}>
                {Math.round(result.expectancy / 10000).toLocaleString()}만원
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">거래 통계</h3>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-500">총 거래:</span>{' '}
              <span className="font-medium">{result.totalTrades}회</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">승률:</span>{' '}
              <span className="font-medium">{result.winRate.toFixed(2)}%</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">평균 승:</span>{' '}
              <span className="font-medium text-red-500">
                {Math.round(result.averageWinAmount / 10000).toLocaleString()}만원
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">평균 패:</span>{' '}
              <span className="font-medium text-blue-500">
                {Math.round(result.averageLossAmount / 10000).toLocaleString()}만원
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">최대 손익</h3>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-500">최대 수익:</span>{' '}
              <span className="font-medium text-red-500">
                {Math.round(result.largestWin / 10000).toLocaleString()}만원
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">최대 손실:</span>{' '}
              <span className="font-medium text-blue-500">
                {Math.round(result.largestLoss / 10000).toLocaleString()}만원
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">최대 손실폭:</span>{' '}
              <span className="font-medium text-red-500">
                {result.maxDrawdown.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">리스크 지표</h3>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-500">Sharpe Ratio:</span>{' '}
              <span className="font-medium">
                {result.sharpeRatio.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 월별 수익률 차트 */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">월별 수익률</h3>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={result.monthlyReturns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="profitRate" fill="#4f46e5" name="수익률 (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 일별 수익률 차트 */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">일별 수익률</h3>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={result.dailyReturns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="profitRate" stroke="#4f46e5" name="수익률 (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 거래 내역 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">거래 내역</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시간</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">유형</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">가격</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">수량</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">손익</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">수익률</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">잔고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {result.trades.map((trade, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm whitespace-nowrap">
                    {new Date(trade.timestamp).toLocaleString()}
                  </td>
                  <td className={`px-4 py-2 text-sm text-right ${
                    trade.type === 'BUY' ? 'text-red-500' : 'text-blue-500'
                  }`}>
                    {trade.type === 'BUY' ? '매수' : '매도'}
                  </td>
                  <td className="px-4 py-2 text-sm text-right">
                    {trade.price.toLocaleString()}원
                  </td>
                  <td className="px-4 py-2 text-sm text-right">
                    {trade.volume.toFixed(8)}
                  </td>
                  <td className={`px-4 py-2 text-sm text-right ${
                    trade.profit 
                      ? trade.profit > 0 ? 'text-red-500' : 'text-blue-500'
                      : ''
                  }`}>
                    {trade.profit 
                      ? `${Math.round(trade.profit / 10000).toLocaleString()}만원`
                      : '-'
                    }
                  </td>
                  <td className={`px-4 py-2 text-sm text-right ${
                    trade.profitRate
                      ? trade.profitRate > 0 ? 'text-red-500' : 'text-blue-500'
                      : ''
                  }`}>
                    {trade.profitRate
                      ? `${trade.profitRate.toFixed(2)}%`
                      : '-'
                    }
                  </td>
                  <td className="px-4 py-2 text-sm text-right">
                    {Math.round(trade.balance / 10000).toLocaleString()}만원
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 거래 패턴 분석 */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">거래 패턴 분석</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* 시간대별 거래 분포 */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">시간대별 거래 분포</h4>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: '오전', value: result.tradePatterns.timeOfDay.morning },
                  { name: '오후', value: result.tradePatterns.timeOfDay.afternoon },
                  { name: '저녁', value: result.tradePatterns.timeOfDay.evening },
                  { name: '야간', value: result.tradePatterns.timeOfDay.night }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4f46e5" name="거래 횟수" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 시간대별 수익 분포 */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">시간대별 수익 분포</h4>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: '오전', value: Math.round(result.tradePatterns.profitByTime.morning / 10000) },
                  { name: '오후', value: Math.round(result.tradePatterns.profitByTime.afternoon / 10000) },
                  { name: '저녁', value: Math.round(result.tradePatterns.profitByTime.evening / 10000) },
                  { name: '야간', value: Math.round(result.tradePatterns.profitByTime.night / 10000) }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="value" 
                    name="수익 (만원)"
                    fill="#4f46e5"
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 추가 패턴 정보 */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">연속 거래</h4>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-gray-500">최대 연승:</span>{' '}
                <span className="font-medium text-red-500">
                  {result.tradePatterns.consecutiveWins}회
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">최대 연패:</span>{' '}
                <span className="font-medium text-blue-500">
                  {result.tradePatterns.consecutiveLosses}회
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">평균 보유 시간</h4>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-gray-500">수익 거래:</span>{' '}
                <span className="font-medium text-red-500">
                  {Math.round(result.tradePatterns.averageHoldingTime.profitable)}분
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">손실 거래:</span>{' '}
                <span className="font-medium text-blue-500">
                  {Math.round(result.tradePatterns.averageHoldingTime.unprofitable)}분
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">거래량 프로파일</h4>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-gray-500">고거래량:</span>{' '}
                <span className="font-medium">
                  {result.tradePatterns.volumeProfile.high}회
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">중거래량:</span>{' '}
                <span className="font-medium">
                  {result.tradePatterns.volumeProfile.medium}회
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">저거래량:</span>{' '}
                <span className="font-medium">
                  {result.tradePatterns.volumeProfile.low}회
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  isProfit?: boolean;
}

function StatCard({ title, value, isProfit }: StatCardProps) {
  return (
    <div className="p-3 bg-gray-50 rounded">
      <div className="text-sm text-gray-500">{title}</div>
      <div className={`text-xl font-bold ${
        isProfit === undefined 
          ? ''
          : isProfit 
            ? 'text-[#d24f45]' 
            : 'text-[#1261c4]'
      }`}>
        {value}
      </div>
    </div>
  );
} 