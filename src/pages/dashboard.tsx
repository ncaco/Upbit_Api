import { useState } from 'react';
import { MarketOverview } from '@/components/dashboard/market-overview';
import { OrderBook } from '@/components/dashboard/order-book';
import { RecentTrades } from '@/components/dashboard/recent-trades';
import { AssetSummary } from '@/components/dashboard/asset-summary';
import { AutoTradingStatus } from '@/components/dashboard/auto-trading-status';
import { RealTimePrice } from '@/components/dashboard/real-time-price';

const AVAILABLE_MARKETS = [
  { value: 'KRW-BTC', label: '비트코인' },
  { value: 'KRW-ETH', label: '이더리움' },
  { value: 'KRW-XRP', label: '리플' }
];

export default function DashboardPage() {
  const [selectedMarket, setSelectedMarket] = useState(AVAILABLE_MARKETS[0].value);

  return (
    <div className="layout-container">
      {/* 마켓 선택 */}
      <div className="mb-6">
        <select
          value={selectedMarket}
          onChange={(e) => setSelectedMarket(e.target.value)}
          className="block w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#093687] focus:border-[#093687]"
        >
          {AVAILABLE_MARKETS.map(market => (
            <option key={market.value} value={market.value}>
              {market.label}
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