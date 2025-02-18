import { MarketOverview } from './market-overview';
import { PriceChart } from './price-chart';
import { RecentTrades } from './recent-trades';
import { AssetSummary } from './asset-summary';
import { RealTimePrice } from './real-time-price';

export function Dashboard() {
  const defaultMarket = "KRW-BTC"; // 기본 마켓 설정

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12">
        <MarketOverview market={defaultMarket} />
      </div>
      
      <div className="col-span-4">
        <RealTimePrice market={defaultMarket} />
      </div>
      
      <div className="col-span-8">
        <PriceChart />
      </div>
      
      <div className="col-span-6">
        <AssetSummary />
      </div>
      
      <div className="col-span-12">
        <RecentTrades market={defaultMarket} />
      </div>
    </div>
  );
} 