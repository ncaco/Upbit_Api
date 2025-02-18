import { useState } from 'react';
import { Card } from '@/components/ui/card';

interface TradingRule {
  market: string;
  buyCondition: {
    type: 'PRICE' | 'VOLUME' | 'CHANGE_RATE';
    value: number;
  };
  sellCondition: {
    type: 'PROFIT' | 'LOSS' | 'TIME';
    value: number;
  };
  amount: number;
  isActive: boolean;
}

const AutoTrading = () => {
  const [tradingRules] = useState<TradingRule[]>([]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4">자동매매 설정</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">매매 규칙 목록</h3>
            <button className="btn btn-primary">
              새 규칙 추가
            </button>
          </div>
          
          {tradingRules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              설정된 매매 규칙이 없습니다
            </div>
          ) : (
            <div className="space-y-4">
              {tradingRules.map((rule, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{rule.market}</h4>
                      <div className="mt-2 space-y-1 text-sm">
                        <p>매수 조건: {rule.buyCondition.type} {rule.buyCondition.value}</p>
                        <p>매도 조건: {rule.sellCondition.type} {rule.sellCondition.value}</p>
                        <p>거래 금액: {rule.amount.toLocaleString()}원</p>
                      </div>
                    </div>
                    <div className="space-x-2">
                      <button className={`btn ${rule.isActive ? 'btn-danger' : 'btn-primary'}`}>
                        {rule.isActive ? '중지' : '시작'}
                      </button>
                      <button className="btn btn-secondary">
                        수정
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4">거래 내역</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">시간</th>
                <th className="px-4 py-2 text-left">종목</th>
                <th className="px-4 py-2 text-left">유형</th>
                <th className="px-4 py-2 text-right">가격</th>
                <th className="px-4 py-2 text-right">수량</th>
                <th className="px-4 py-2 text-right">금액</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 text-center text-gray-500" colSpan={6}>
                  거래 내역이 없습니다
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default AutoTrading;
