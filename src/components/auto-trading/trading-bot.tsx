import { useState } from 'react';

interface TradingStrategy {
  name: string;
  enabled: boolean;
  params: {
    buyCondition: number;
    sellCondition: number;
    stopLoss: number;
  };
}

export function TradingBot() {
  const [strategies, setStrategies] = useState<TradingStrategy[]>([
    {
      name: '변동성 돌파',
      enabled: true,
      params: {
        buyCondition: 0.5,
        sellCondition: 1.0,
        stopLoss: 2.0
      }
    }
  ]);

  const toggleStrategy = (index: number) => {
    setStrategies(prev => prev.map((strategy, i) => 
      i === index ? {...strategy, enabled: !strategy.enabled} : strategy
    ));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-medium text-gray-900">자동매매 설정</h2>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {strategies.map((strategy, index) => (
            <div key={strategy.name} className="border border-gray-100 rounded-lg overflow-hidden">
              {/* 전략 헤더 */}
              <div className="flex items-center justify-between p-4 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <h3 className="font-medium text-gray-900">{strategy.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    strategy.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {strategy.enabled ? '실행 중' : '중지됨'}
                  </span>
                </div>
                <button
                  onClick={() => toggleStrategy(index)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    strategy.enabled 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  {strategy.enabled ? '중지하기' : '시작하기'}
                </button>
              </div>
              
              {/* 전략 파라미터 */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">매수 조건</label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="number"
                        value={strategy.params.buyCondition}
                        onChange={() => {}}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-500">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">매도 조건</label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="number"
                        value={strategy.params.sellCondition}
                        onChange={() => {}}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-500">%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">손절 라인</label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="number"
                      value={strategy.params.stopLoss}
                      onChange={() => {}}
                      className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-500">%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 