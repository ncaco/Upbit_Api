import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { account } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

export function OrderForm() {
  const [orderType, setOrderType] = useState<'bid' | 'ask'>('bid');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await account.createOrder({
        market: 'KRW-BTC',
        side: orderType,
        price,
        volume: amount,
        ord_type: 'limit'
      });
      // 주문 성공 처리
    } catch (error) {
      // 에러 처리
      console.error(error);
    }
  };

  return (
    <Card className="p-4 bg-[#f9f9f9]">
      <h2 className="text-lg font-bold mb-4">주문하기</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            className={`flex-1 py-2 rounded ${
              orderType === 'bid' 
                ? 'bg-[#c84a31] text-white' 
                : 'bg-gray-100'
            }`}
            onClick={() => setOrderType('bid')}
          >
            매수
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded ${
              orderType === 'ask' 
                ? 'bg-[#1261c4] text-white' 
                : 'bg-gray-100'
            }`}
            onClick={() => setOrderType('ask')}
          >
            매도
          </button>
        </div>

        <div>
          <label className="block text-sm mb-1">주문 가격</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="KRW"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">주문 수량</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="BTC"
          />
        </div>

        <button
          type="submit"
          className={`w-full py-2 rounded text-white ${
            orderType === 'bid' ? 'bg-[#c84a31]' : 'bg-[#1261c4]'
          }`}
        >
          {orderType === 'bid' ? '매수' : '매도'}
        </button>
      </form>
    </Card>
  );
} 