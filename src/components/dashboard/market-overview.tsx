'use client';

import { useQuery } from '@tanstack/react-query';
import { market } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

export function MarketOverview() {
  const { data: tickers } = useQuery({
    queryKey: ['tickers', 'KRW-BTC'],
    queryFn: () => market.getTicker('KRW-BTC'),
    refetchInterval: 1000,
  });

  const ticker = tickers?.data[0];

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card className="bg-[#f9f9f9]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-500">현재가</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {formatNumber(ticker?.trade_price || 0)}
            <span className="text-sm text-gray-500 ml-1">KRW</span>
          </p>
          <p className={`text-sm ${
            ticker?.change === 'RISE' ? 'text-[#c84a31]' : 'text-[#1261c4]'
          }`}>
            {(ticker?.change_rate * 100).toFixed(2)}%
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-[#f9f9f9]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-500">24시간 거래량</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {formatNumber(ticker?.acc_trade_volume_24h || 0)} BTC
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-[#f9f9f9]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-500">24시간 거래대금</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {formatNumber(ticker?.acc_trade_price_24h || 0)}원
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-[#f9f9f9]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-500">52주 신고가</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {formatNumber(ticker?.highest_52_week_price || 0)}원
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 