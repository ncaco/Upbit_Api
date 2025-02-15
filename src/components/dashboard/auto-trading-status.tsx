import { Card } from '@/components/ui/card';

export function AutoTradingStatus() {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-bold mb-4">자동매매 상태</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span>상태</span>
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
            활성화
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>실행 시간</span>
          <span>2시간 30분</span>
        </div>
        <div className="flex justify-between items-center">
          <span>거래 횟수</span>
          <span>15회</span>
        </div>
      </div>
    </Card>
  );
} 