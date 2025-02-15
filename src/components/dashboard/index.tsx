import { MarketOverview } from './market-overview';
import { PriceChart } from './price-chart';
import { OrderBook } from './order-book';
import { RecentTrades } from './recent-trades';
import { AssetSummary } from './asset-summary';
import { AutoTradingStatus } from './auto-trading-status';
import { RealTimePrice } from './real-time-price';

export function Dashboard() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12">
        <MarketOverview />
      </div>
      
      <div className="col-span-4">
        <RealTimePrice />
      </div>
      
      <div className="col-span-8">
        <PriceChart />
      </div>
      
      <div className="col-span-4">
        <OrderBook />
      </div>
      
      <div className="col-span-6">
        <AssetSummary />
      </div>
      <div className="col-span-6">
        <AutoTradingStatus />
      </div>
      
      <div className="col-span-12">
        <RecentTrades />
      </div>
    </div>
  );
} 