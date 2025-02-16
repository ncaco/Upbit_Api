import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { market } from '@/lib/api';
import type { Market, Ticker } from '@/lib/api/market';
import { MarketOverview } from '@/components/dashboard/market-overview';
import { OrderBook } from '@/components/dashboard/order-book';
import { RecentTrades } from '@/components/dashboard/recent-trades';
import { AssetSummary } from '@/components/dashboard/asset-summary';
import { AutoTradingStatus } from '@/components/dashboard/auto-trading-status';
import { RealTimePrice } from '@/components/dashboard/real-time-price';

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

type SortOption = (typeof SORT_OPTIONS)[number]['value'];

const SORT_OPTIONS = [
  { value: 'price', label: '가격순' },
  { value: 'volume', label: '거래량순' },
  { value: 'change', label: '변동률순' },
  { value: 'name', label: '이름순' }
] as const;

export default function DashboardPage() {
  const [sortOption, setSortOption] = useState<SortOption>('price');
  const [selectedMarket, setSelectedMarket] = useState<string>('KRW-BTC');

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

  // 마켓 목록 로딩 중일 때
  if (isMarketsLoading) {
    return (
      <div className="layout-container">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-48 mb-6" />
          <div className="space-y-6">
            <div className="h-40 bg-gray-200 rounded" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="h-40 bg-gray-200 rounded" />
              </div>
              <div className="h-40 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-container">
      {/* 마켓 선택 및 정렬 옵션 */}
      <div className="mb-6 flex gap-4">
        <select
          value={selectedMarket}
          onChange={(e) => setSelectedMarket(e.target.value)}
          className="block w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#093687] focus:border-[#093687]"
        >
          {sortedMarkets.map((market: SortableMarket) => (
            <option key={market.value} value={market.value}>
              {market.label}
            </option>
          ))}
        </select>

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          className="block w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#093687] focus:border-[#093687]"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 시장 개요 */}
      <div className="grid-container grid-cols-1">
        <MarketOverview market={selectedMarket} />
      </div>

      {/* 차트 및 호가 */}
      <div className="grid-container grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <RealTimePrice market={selectedMarket} />
          </div>
        </div>
        <div>
          <OrderBook market={selectedMarket} />
        </div>
      </div>

      {/* 자산 및 자동매매 현황 */}
      <div className="grid-container grid-cols-1 lg:grid-cols-2">
        <AssetSummary />
        <AutoTradingStatus />
      </div>

      {/* 최근 체결 */}
      <div className="grid-container grid-cols-1">
        <RecentTrades market={selectedMarket} />
      </div>
    </div>
  );
} 