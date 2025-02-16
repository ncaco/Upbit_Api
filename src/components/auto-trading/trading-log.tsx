import { useQuery } from '@tanstack/react-query';
import { trading } from '@/lib/api/trading';
import type { TradingLog as TradingLogType } from '@/types/trading';

export function TradingLog() {
  const { data: strategies = [] } = useQuery({
    queryKey: ['trading', 'strategies'],
    queryFn: async () => {
      const response = await trading.getStrategies();
      return response.data;
    }
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['trading', 'logs'],
    queryFn: async () => {
      const logsPromises = strategies.map(strategy =>
        trading.getTradingLogs(strategy.id, {
          limit: 50,
          offset: 0
        }).then(response => response.data)
      );
      const allLogs = await Promise.all(logsPromises);
      return allLogs
        .flat()
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
    enabled: strategies.length > 0,
    refetchInterval: 1000
  });

  const getLogStyle = (type: TradingLogType['type']) => {
    switch (type) {
      case 'SUCCESS':
        return 'text-green-600 bg-green-50';
      case 'ERROR':
        return 'text-red-600 bg-red-50';
      case 'WARNING':
        return 'text-yellow-600 bg-yellow-50';
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
                  {log.createdAt.toLocaleTimeString()}
                </span>
              </div>
              {log.data && (
                <div className="mt-1 text-xs text-gray-500">
                  {Object.entries(log.data).map(([key, value]) => (
                    <div key={key}>
                      {key}: {JSON.stringify(value)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 