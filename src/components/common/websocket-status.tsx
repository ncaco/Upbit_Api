import { useWebSocket } from '@/hooks/use-websocket';

export function WebSocketStatus() {
  const { status } = useWebSocket();

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'disconnected':
        return 'bg-red-500';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className="text-sm text-gray-500">
        {status === 'connected' ? '연결됨' : status === 'connecting' ? '연결 중...' : '연결 끊김'}
      </span>
    </div>
  );
} 