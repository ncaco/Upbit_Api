import { useState } from 'react';
import { Card } from '@/components/ui/card';

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
    <Card className="p-4">
      <h2 className="text-lg font-bold mb-4">자동매매 설정</h2>
      <div className="space-y-4">
        {strategies.map((strategy, index) => (
          <div key={strategy.name} className="p-4 border rounded">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">{strategy.name}</span>
              <button
                onClick={() => toggleStrategy(index)}
                className={`px-3 py-1 rounded ${
                  strategy.enabled ? 'bg-green-500 text-white' : 'bg-gray-200'
                }`}
              >
                {strategy.enabled ? '활성화' : '비활성화'}
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>매수 조건</span>
                <span>{strategy.params.buyCondition}%</span>
              </div>
              <div className="flex justify-between">
                <span>매도 조건</span>
                <span>{strategy.params.sellCondition}%</span>
              </div>
              <div className="flex justify-between">
                <span>손절 라인</span>
                <span>{strategy.params.stopLoss}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
} 