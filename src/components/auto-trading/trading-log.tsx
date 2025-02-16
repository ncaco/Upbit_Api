import { useState } from 'react';

interface LogEntry {
  id: number;
  timestamp: Date;
  type: 'info' | 'success' | 'error';
  message: string;
}

export function TradingLog() {
  const [logs] = useState<LogEntry[]>([
    {
      id: 1,
      timestamp: new Date(),
      type: 'info',
      message: '자동매매 시작'
    },
    {
      id: 2,
      timestamp: new Date(),
      type: 'success',
      message: 'KRW-BTC 매수 주문 체결 (30,000,000 KRW)'
    },
    {
      id: 3,
      timestamp: new Date(),
      type: 'error',
      message: 'KRW-BTC 매도 주문 실패 (잔고 부족)'
    }
  ]);

  const getLogStyle = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-medium text-gray-900">거래 로그</h2>
      </div>
      <div className="p-4">
        <div className="space-y-2">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className={`p-3 rounded-lg ${getLogStyle(log.type)}`}
            >
              <div className="flex items-start justify-between">
                <span className="text-sm">{log.message}</span>
                <span className="text-xs text-gray-500 ml-4">
                  {log.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 