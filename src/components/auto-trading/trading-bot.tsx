import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trading } from '@/lib/api/trading';
import { market } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import type { TradingStrategy, TradingStrategyType } from '@/types/trading';
import type { Market, Ticker } from '@/lib/api/market';
import { BacktestRunner } from './backtest-runner';

interface MarketWithTicker extends Market {
  ticker?: Ticker;
}

interface SortableMarket {
  value: string;
  label: string;
  volume: number;
  price: number;
  change: number;
}

type SortOption = 'price' | 'volume' | 'change' | 'name';

const SORT_OPTIONS = [
  { value: 'price', label: '가격순' },
  { value: 'volume', label: '거래량순' },
  { value: 'change', label: '변동률순' },
  { value: 'name', label: '이름순' }
] as const;

const STRATEGY_TYPES: Record<TradingStrategyType, string> = {
  'VOLATILITY_BREAKOUT': '변동성 돌파',
  'MOVING_AVERAGE': '이동평균선 교차',
  'RSI': 'RSI'
};

const DEFAULT_PARAMS: Record<TradingStrategyType, Record<string, number>> = {
  'VOLATILITY_BREAKOUT': {
    k: 0.5,
    profitTarget: 1.0,
    stopLoss: 2.0
  },
  'MOVING_AVERAGE': {
    shortPeriod: 5,
    longPeriod: 20,
    profitTarget: 1.0,
    stopLoss: 2.0
  },
  'RSI': {
    period: 14,
    oversold: 30,
    overbought: 70,
    profitTarget: 1.0,
    stopLoss: 2.0
  }
};

export function TradingBot() {
  const queryClient = useQueryClient();
  const [selectedMarket, setSelectedMarket] = useState('KRW-BTC');
  const [selectedStrategy, setSelectedStrategy] = useState<TradingStrategy | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('volume');

  // 마켓 목록 및 현재가 조회
  const { data: marketsData, isLoading: isMarketsLoading } = useQuery({
    queryKey: ['markets'],
    queryFn: async () => {
      const marketsResponse = await market.getMarkets();
      const krwMarkets = marketsResponse.data.filter((m: Market) => m.market.startsWith('KRW-'));
      const tickersResponse = await market.getTicker(krwMarkets.map((m: Market) => m.market).join(','));
      
      return krwMarkets.map((m: Market) => {
        const ticker = tickersResponse.data.find((t: Ticker) => t.market === m.market);
        return {
          ...m,
          ticker
        } as MarketWithTicker;
      });
    }
  });

  // 정렬된 마켓 목록
  const sortedMarkets = useMemo(() => {
    if (!marketsData) return [];

    return marketsData
      .map((market: MarketWithTicker): SortableMarket => ({
        value: market.market,
        label: market.korean_name,
        volume: market.ticker?.acc_trade_price_24h || 0,
        price: market.ticker?.trade_price || 0,
        change: market.ticker?.signed_change_rate || 0
      }))
      .sort((a: SortableMarket, b: SortableMarket) => {
        switch (sortOption) {
          case 'name':
            return a.label.localeCompare(b.label, 'ko-KR');
          case 'volume':
            return b.volume - a.volume;
          case 'price':
            return b.price - a.price;
          case 'change':
            return b.change - a.change;
          default:
            return 0;
        }
      });
  }, [marketsData, sortOption]);

  // 전략 목록 조회
  const { data: strategies = [] } = useQuery({
    queryKey: ['trading', 'strategies'],
    queryFn: async () => {
      const response = await trading.getStrategies();
      return response.data;
    }
  });

  // 전략 생성
  const createStrategy = useMutation({
    mutationFn: (type: TradingStrategyType) => trading.createStrategy({
      type,
      market: selectedMarket,
      enabled: false,
      params: DEFAULT_PARAMS[type]
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trading', 'strategies'] });
    }
  });

  // 전략 업데이트
  const updateStrategy = useMutation({
    mutationFn: (strategy: Partial<TradingStrategy> & { id: string }) => 
      trading.updateStrategy(strategy.id, strategy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trading', 'strategies'] });
    }
  });

  // 전략 삭제
  const deleteStrategy = useMutation({
    mutationFn: (id: string) => trading.deleteStrategy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trading', 'strategies'] });
      if (selectedStrategy?.id === id) {
        setSelectedStrategy(null);
      }
    }
  });

  // 전략 시작/중지
  const toggleStrategy = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      if (enabled) {
        await trading.startStrategy(id);
      } else {
        await trading.stopStrategy(id);
      }
      return trading.updateStrategy(id, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trading', 'strategies'] });
    }
  });

  if (isMarketsLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded w-48" />
        <div className="h-40 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 전략 설정 */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">자동매매 설정</h2>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <select
                  value={selectedMarket}
                  onChange={(e) => setSelectedMarket(e.target.value)}
                  className="text-sm"
                >
                  {sortedMarkets.map((market) => (
                    <option key={market.value} value={market.value}>
                      {market.label} ({formatNumber(market.price)}원)
                    </option>
                  ))}
                </select>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="text-sm"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => createStrategy.mutate('VOLATILITY_BREAKOUT')}
                className="btn btn-primary"
              >
                전략 추가
              </button>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {strategies.map((strategy) => (
              <div key={strategy.id} className="border border-gray-100 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-gray-900">
                      {STRATEGY_TYPES[strategy.type]}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      strategy.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {strategy.enabled ? '실행 중' : '중지됨'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleStrategy.mutate({
                        id: strategy.id,
                        enabled: !strategy.enabled
                      })}
                      className={`btn ${
                        strategy.enabled 
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      {strategy.enabled ? '중지하기' : '시작하기'}
                    </button>
                    <button
                      onClick={() => setSelectedStrategy(strategy)}
                      className="btn bg-blue-50 text-blue-600 hover:bg-blue-100"
                    >
                      백테스트
                    </button>
                    <button
                      onClick={() => deleteStrategy.mutate(strategy.id)}
                      className="btn btn-danger"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  {Object.entries(strategy.params).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-2 gap-4">
                      <label className="block text-sm font-medium text-gray-700">
                        {key}
                      </label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => updateStrategy.mutate({
                            id: strategy.id,
                            params: {
                              ...strategy.params,
                              [key]: parseFloat(e.target.value)
                            }
                          })}
                          className="block w-full text-sm"
                          disabled={strategy.enabled}
                        />
                        <span className="ml-2 text-sm text-gray-500">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 백테스트 */}
      {selectedStrategy && (
        <BacktestRunner 
          strategy={selectedStrategy}
          onClose={() => setSelectedStrategy(null)}
        />
      )}
    </div>
  );
} 