'use client';

import { useQuery } from '@tanstack/react-query';
import { market, account } from '@/lib/api';
import { MarketOverview } from '@/components/dashboard/market-overview';
import { PriceChart } from '@/components/dashboard/price-chart';
import { OrderBook } from '@/components/dashboard/order-book';
import { RecentTrades } from '@/components/dashboard/recent-trades';
import { AssetSummary } from '@/components/dashboard/asset-summary';
import { AutoTradingStatus } from '@/components/dashboard/auto-trading-status';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-12 gap-4">
      {/* 상단 요약 정보 */}
      <div className="col-span-12">
        <MarketOverview />
      </div>
      
      {/* 차트 및 주문 */}
      <div className="col-span-8">
        <PriceChart />
      </div>
      <div className="col-span-4">
        <OrderBook />
      </div>
      
      {/* 자산 및 거래 현황 */}
      <div className="col-span-6">
        <AssetSummary />
      </div>
      <div className="col-span-6">
        <AutoTradingStatus />
      </div>
      
      {/* 최근 거래 내역 */}
      <div className="col-span-12">
        <RecentTrades />
      </div>
    </div>
  );
} 