import { useState } from 'react';

interface Strategy {
  name: string;
  enabled: boolean;
  profit: number;
  trades: number;
}

export function AutoTradingStatus() {
  const [strategies] = useState<Strategy[]>([
    {
      name: '변동성 돌파',
      enabled: true,
      profit: 2.5,
      trades: 12
    },
    {
      name: '이동평균선 교차',
      enabled: false,
      profit: -1.2,
      trades: 8
    }
  ]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-medium text-gray-900">자동매매 현황</h2>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {strategies.map((strategy) => (
            <div key={strategy.name} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{strategy.name}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    strategy.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {strategy.enabled ? '실행 중' : '중지됨'}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  총 {strategy.trades}회 거래
                </div>
              </div>
              <div className="text-right">
                <div className={`font-medium ${
                  strategy.profit >= 0 ? 'text-[#d24f45]' : 'text-[#1261c4]'
                }`}>
                  {strategy.profit >= 0 ? '+' : ''}{strategy.profit.toFixed(2)}%
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  수익률
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 