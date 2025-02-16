import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { trading } from '@/lib/api/trading';
import { BacktestResult as BacktestResultComponent } from './backtest-result';
import type { TradingStrategy, BacktestResult, BacktestTrade } from '@/types/trading';
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

interface BacktestRunnerProps {
  strategy: TradingStrategy;
  onClose: () => void;
}

interface IntermediateResult {
  trades: BacktestTrade[];
  currentBalance: number;
  totalProfit: number;
  profitRate: number;
  winCount: number;
  lossCount: number;
  maxDrawdown: number;
  lastPrice: number;
  position: 'NONE' | 'LONG' | 'SHORT';
  lastTradeTime: string;
}

interface BacktestConfig {
  id: string;
  name: string;
  strategy: TradingStrategy;
  period: string;
  initialCapital: number;
  createdAt: Date;
  result?: BacktestResult;  // 백테스트 결과 저장
}

interface ComparisonData {
  name: string;
  period: string;
  initialCapital: number;
  result: BacktestResult;
  profitRate: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  sharpeRatio: number;
}

interface MonthlyData {
  month: string;
  [key: string]: string | number;
}

function ComparisonModal({ data, onClose }: { data: ComparisonData[]; onClose: () => void }) {
  // 월별 수익률 데이터 준비
  const monthlyData = data.reduce((acc, item) => {
    item.result.monthlyReturns.forEach(monthly => {
      if (!acc[monthly.month]) {
        acc[monthly.month] = { month: monthly.month };
      }
      acc[monthly.month][item.name] = monthly.profitRate;
    });
    return acc;
  }, {} as Record<string, MonthlyData>);

  const monthlyChartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">백테스트 결과 비교</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* 요약 지표 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium mb-2">수익률 비교</h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.map(item => ({
                  name: item.name,
                  수익률: item.profitRate,
                  '최대 손실폭': item.maxDrawdown
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="수익률" fill="#4f46e5" />
                  <Bar dataKey="최대 손실폭" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">거래 지표 비교</h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.map(item => ({
                  name: item.name,
                  '승률(%)': item.winRate,
                  '거래횟수': item.totalTrades,
                  'Sharpe비율': item.sharpeRatio
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="승률(%)" fill="#22c55e" />
                  <Bar dataKey="거래횟수" fill="#f59e0b" />
                  <Bar dataKey="Sharpe비율" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 월별 수익률 추이 */}
        <div>
          <h3 className="text-sm font-medium mb-2">월별 수익률 추이</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {data.map((item, index) => (
                  <Line
                    key={item.name}
                    type="monotone"
                    dataKey={item.name}
                    stroke={[
                      '#4f46e5',
                      '#ef4444',
                      '#22c55e',
                      '#f59e0b',
                      '#06b6d4'
                    ][index % 5]}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 상세 비교 테이블 */}
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">상세 지표 비교</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">설정명</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">기간/자본</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">수익률</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">최대손실폭</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">승률</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">거래횟수</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sharpe비율</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map(item => (
                  <tr key={item.name}>
                    <td className="px-4 py-2 text-sm">{item.name}</td>
                    <td className="px-4 py-2 text-sm text-right">{item.period} / {item.initialCapital}만원</td>
                    <td className="px-4 py-2 text-sm text-right">
                      <span className={item.profitRate >= 0 ? 'text-red-500' : 'text-blue-500'}>
                        {item.profitRate.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-red-500">
                      {item.maxDrawdown.toFixed(2)}%
                    </td>
                    <td className="px-4 py-2 text-sm text-right">
                      {(item.winRate * 100).toFixed(2)}%
                    </td>
                    <td className="px-4 py-2 text-sm text-right">{item.totalTrades}</td>
                    <td className="px-4 py-2 text-sm text-right">{item.sharpeRatio.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BacktestRunner({ strategy, onClose }: BacktestRunnerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [period, setPeriod] = useState('1M'); // 1M, 3M, 6M, 1Y
  const [initialCapital, setInitialCapital] = useState(1000); // 단위: 만원
  const [progress, setProgress] = useState<string>('');
  const [intermediateResult, setIntermediateResult] = useState<IntermediateResult | null>(null);
  const [configName, setConfigName] = useState('');
  const [selectedConfigs, setSelectedConfigs] = useState<string[]>([]);
  const [savedConfigs, setSavedConfigs] = useState<BacktestConfig[]>(() => {
    const saved = localStorage.getItem('backtest_configs');
    return saved ? JSON.parse(saved) : [];
  });
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);

  // 설정 저장
  const saveConfig = useCallback(() => {
    if (!configName.trim()) {
      alert('설정 이름을 입력해주세요.');
      return;
    }

    const newConfig: BacktestConfig = {
      id: Date.now().toString(),
      name: configName.trim(),
      strategy,
      period,
      initialCapital,
      createdAt: new Date()
    };

    const updatedConfigs = [...savedConfigs, newConfig];
    setSavedConfigs(updatedConfigs);
    localStorage.setItem('backtest_configs', JSON.stringify(updatedConfigs));
    setConfigName('');
  }, [configName, strategy, period, initialCapital, savedConfigs]);

  // 결과 저장
  const saveResult = useCallback(() => {
    if (!result || !configName.trim()) {
      alert('백테스트 결과가 없거나 설정 이름이 입력되지 않았습니다.');
      return;
    }

    const newConfig: BacktestConfig = {
      id: Date.now().toString(),
      name: configName.trim(),
      strategy,
      period,
      initialCapital,
      createdAt: new Date(),
      result
    };

    const updatedConfigs = [...savedConfigs, newConfig];
    setSavedConfigs(updatedConfigs);
    localStorage.setItem('backtest_configs', JSON.stringify(updatedConfigs));
    setConfigName('');
  }, [configName, strategy, period, initialCapital, savedConfigs, result]);

  // 결과 내보내기
  const exportResult = useCallback(() => {
    if (!result) {
      alert('백테스트 결과가 없습니다.');
      return;
    }

    const exportData = {
      strategy: {
        market: strategy.market,
        type: strategy.type,
        params: strategy.params
      },
      settings: {
        period,
        initialCapital
      },
      result: {
        summary: {
          totalTrades: result.totalTrades,
          winRate: result.winRate,
          totalProfit: result.totalProfit,
          profitRate: result.profitRate,
          maxDrawdown: result.maxDrawdown,
          sharpeRatio: result.sharpeRatio
        },
        trades: result.trades,
        monthlyReturns: result.monthlyReturns,
        dailyReturns: result.dailyReturns
      },
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backtest_${strategy.market}_${period}_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [result, strategy, period, initialCapital]);

  // 설정 불러오기
  const loadConfig = useCallback((config: BacktestConfig) => {
    setPeriod(config.period);
    setInitialCapital(config.initialCapital);
  }, []);

  // 설정 삭제
  const deleteConfig = useCallback((id: string) => {
    const updatedConfigs = savedConfigs.filter(config => config.id !== id);
    setSavedConfigs(updatedConfigs);
    localStorage.setItem('backtest_configs', JSON.stringify(updatedConfigs));
  }, [savedConfigs]);

  // 결과 비교
  const compareResults = useCallback(() => {
    const selectedResults = savedConfigs
      .filter(config => selectedConfigs.includes(config.id))
      .filter(config => config.result);

    if (selectedResults.length < 2) {
      alert('비교할 결과를 2개 이상 선택해주세요.');
      return;
    }

    const data = selectedResults.map(config => ({
      name: config.name,
      period: config.period,
      initialCapital: config.initialCapital,
      result: config.result!,
      profitRate: config.result!.profitRate,
      maxDrawdown: config.result!.maxDrawdown,
      winRate: config.result!.winRate,
      totalTrades: config.result!.totalTrades,
      sharpeRatio: config.result!.sharpeRatio
    }));

    // 결과를 수익률 기준으로 정렬
    data.sort((a, b) => b.profitRate - a.profitRate);
    
    setComparisonData(data);
    setShowComparison(true);
  }, [savedConfigs, selectedConfigs]);

  // 설정 선택 토글
  const toggleConfigSelection = useCallback((id: string) => {
    setSelectedConfigs(prev => 
      prev.includes(id) 
        ? prev.filter(configId => configId !== id)
        : [...prev, id]
    );
  }, []);

  const runBacktest = async () => {
    try {
      setIsLoading(true);
      setProgress('백테스트 실행 중...');
      setIntermediateResult(null);

      const result = await trading.backtest({
        strategy,
        period,
        initialCapital
      });

      setResult(result);
      setProgress('완료');
    } catch (error) {
      console.error('Backtest error:', error);
      alert(error instanceof Error ? error.message : '백테스트 실행 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setProgress('');
      setIntermediateResult(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">백테스팅 설정</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* 설정 저장/불러오기 */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">설정 저장/불러오기</h3>
          <div className="flex gap-4 mb-2">
            <div className="flex-1">
              <input
                type="text"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder="설정 이름"
                className="w-full text-sm"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={saveConfig}
              disabled={isLoading || !configName.trim()}
              className="btn bg-blue-50 text-blue-600 hover:bg-blue-100"
            >
              설정 저장
            </button>
            {result && (
              <button
                onClick={saveResult}
                disabled={isLoading || !configName.trim()}
                className="btn bg-green-50 text-green-600 hover:bg-green-100"
              >
                결과 저장
              </button>
            )}
          </div>
          
          {savedConfigs.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-2">
                {savedConfigs.map(config => (
                  <div 
                    key={config.id}
                    className={`flex items-center justify-between p-2 rounded ${
                      selectedConfigs.includes(config.id)
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50'
                    }`}
                    onClick={() => config.result && toggleConfigSelection(config.id)}
                    style={{ cursor: config.result ? 'pointer' : 'default' }}
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium">{config.name}</div>
                      <div className="text-xs text-gray-500">
                        {config.period} / {config.initialCapital}만원
                        {config.result && (
                          <span className="ml-2 text-blue-500">
                            ({config.result.profitRate.toFixed(2)}%)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          loadConfig(config);
                        }}
                        disabled={isLoading}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        불러오기
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConfig(config.id);
                        }}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-800"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 결과 비교 버튼 */}
              {savedConfigs.some(config => config.result) && (
                <div className="flex justify-end mt-2">
                  <button
                    onClick={compareResults}
                    disabled={selectedConfigs.length < 2}
                    className={`btn ${
                      selectedConfigs.length < 2
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    }`}
                  >
                    선택한 결과 비교 ({selectedConfigs.length})
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* 테스트 기간 설정 */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              테스트 기간
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full text-sm"
              disabled={isLoading}
            >
              <option value="1M">1개월</option>
              <option value="3M">3개월</option>
              <option value="6M">6개월</option>
              <option value="1Y">1년</option>
            </select>
          </div>

          {/* 초기 자본 설정 */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              초기 자본
            </label>
            <div className="flex items-center">
              <input
                type="number"
                min="1"
                step="1"
                value={initialCapital}
                onChange={(e) => setInitialCapital(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-sm"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-500">만원</span>
            </div>
          </div>

          {/* 현재 설정 표시 */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              전략 정보
            </label>
            <div className="text-sm text-gray-600">
              {strategy.market} / {strategy.type}
            </div>
          </div>
        </div>

        {/* 전략 파라미터 표시 */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">전략 파라미터</h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(strategy.params).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="text-gray-500">{key}:</span>{' '}
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 진행 상태 표시 */}
        {progress && (
          <div className="mb-4">
            <div className="text-sm text-gray-600 whitespace-pre-line">{progress}</div>
            {intermediateResult && (
              <div className="mt-2 space-y-2">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm">
                    <span className="text-gray-500">거래 횟수:</span>{' '}
                    <span className="font-medium">{intermediateResult.trades.length}회</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">현재 잔고:</span>{' '}
                    <span className="font-medium">{Math.round(intermediateResult.currentBalance / 10000)}만원</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">승/패:</span>{' '}
                    <span className="font-medium">{intermediateResult.winCount}/{intermediateResult.lossCount}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm">
                    <span className="text-gray-500">수익률:</span>{' '}
                    <span className={`font-medium ${
                      intermediateResult.profitRate > 0 ? 'text-red-500' : 
                      intermediateResult.profitRate < 0 ? 'text-blue-500' : ''
                    }`}>
                      {intermediateResult.profitRate.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">최대 손실폭:</span>{' '}
                    <span className="font-medium text-red-500">
                      {intermediateResult.maxDrawdown.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">현재 가격:</span>{' '}
                    <span className="font-medium">
                      {intermediateResult.lastPrice.toLocaleString()}원
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm">
                    <span className="text-gray-500">포지션:</span>{' '}
                    <span className={`font-medium ${
                      intermediateResult.position === 'LONG' ? 'text-red-500' :
                      intermediateResult.position === 'SHORT' ? 'text-blue-500' : ''
                    }`}>
                      {intermediateResult.position === 'LONG' ? '매수' :
                       intermediateResult.position === 'SHORT' ? '매도' : '없음'}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">마지막 거래:</span>{' '}
                    <span className="font-medium">
                      {intermediateResult.lastTradeTime}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={runBacktest}
            disabled={isLoading}
            className={`btn ${
              isLoading 
                ? 'bg-gray-100 text-gray-400'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            {isLoading ? '실행 중...' : '백테스트 실행'}
          </button>
        </div>

        {/* 결과 내보내기 버튼 */}
        {result && (
          <div className="flex justify-end mt-4">
            <button
              onClick={exportResult}
              className="btn bg-purple-50 text-purple-600 hover:bg-purple-100"
            >
              결과 내보내기
            </button>
          </div>
        )}
      </Card>

      {result && <BacktestResultComponent result={result} initialCapital={initialCapital * 10000} />}

      {showComparison && (
        <ComparisonModal
          data={comparisonData}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
} 