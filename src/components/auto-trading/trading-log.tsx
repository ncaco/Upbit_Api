import { Card } from '@/components/ui/card';

interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'error';
  message: string;
}

export function TradingLog() {
  const logs: LogEntry[] = [
    {
      timestamp: '2024-01-10 14:23:45',
      type: 'success',
      message: 'BTC 매수 주문 체결: 50,000,000원 x 0.1 BTC'
    },
    {
      timestamp: '2024-01-10 14:22:30',
      type: 'info',
      message: '변동성 돌파 전략: 매수 신호 감지'
    },
    {
      timestamp: '2024-01-10 14:20:15',
      type: 'error',
      message: 'API 요청 실패: Rate limit exceeded'
    }
  ];

  const getTypeStyle = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="p-4">
      <h2 className="text-lg font-bold mb-4">실행 로그</h2>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {logs.map((log, index) => (
          <div key={index} className="text-sm border-b pb-2">
            <div className="text-gray-500">{log.timestamp}</div>
            <div className={getTypeStyle(log.type)}>{log.message}</div>
          </div>
        ))}
      </div>
    </Card>
  );
} 