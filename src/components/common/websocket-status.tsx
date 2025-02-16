import { useEffect, useRef } from 'react';
import { useWebSocket } from '@/hooks/use-upbit-websocket';
import { WebSocketManager } from '@/lib/websocket-manager';

export function WebSocketStatus() {
  const { status } = useWebSocket();
  const statusRef = useRef(status);
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    if (statusRef.current !== status) {
      //console.log('WebSocket 상태 변경:', {
      //  이전상태: statusRef.current,
      //  현재상태: status,
      //  시간: new Date().toLocaleTimeString(),
      //  재연결시도: reconnectAttempts.current
      //});
      statusRef.current = status;
    }

    if (status === 'connected') {
      reconnectAttempts.current = 0;
    }
  }, [status]);

  useEffect(() => {
    //console.log('WebSocket 초기화...');
    const wsManager = WebSocketManager.getInstance();
    
    // 초기 연결 시도
    //console.log('WebSocket 연결 시도...');
    wsManager.connect();

    return () => {
      //console.log('WebSocket 정리...');
      wsManager.disconnect();
    };
  }, []);

  const statusConfig = {
    connecting: {
      color: 'bg-yellow-400',
      pulseColor: 'bg-yellow-100',
      text: '연결 중',
      textColor: 'text-yellow-600'
    },
    connected: {
      color: 'bg-green-400',
      pulseColor: 'bg-green-100',
      text: '연결됨',
      textColor: 'text-green-600'
    },
    disconnected: {
      color: 'bg-red-400',
      pulseColor: 'bg-red-100',
      text: '연결 끊김',
      textColor: 'text-red-600'
    }
  }[status];

  const handleReconnect = () => {
    reconnectAttempts.current += 1;
    //console.log('수동 재연결 시도...', {
    //  시도횟수: reconnectAttempts.current,
    //  시간: new Date().toLocaleTimeString()
    //});
    
    const wsManager = WebSocketManager.getInstance();
    wsManager.disconnect(); // 먼저 연결을 완전히 종료하고 상태 초기화
    setTimeout(() => {
      wsManager.connect(); // 약간의 지연 후 재연결
    }, 100);
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <div 
          className={`w-2.5 h-2.5 rounded-full ${statusConfig.color}`} 
          title={`현재 상태: ${status}\n마지막 변경: ${new Date().toLocaleTimeString()}\n재연결 시도: ${reconnectAttempts.current}회`}
        />
        <div 
          className={`absolute -inset-1 ${statusConfig.pulseColor} rounded-full animate-pulse opacity-75`} 
          style={{ animationDuration: '2s' }}
        />
      </div>
      <span className={`text-xs font-medium ${statusConfig.textColor}`}>
        {statusConfig.text}
        {reconnectAttempts.current > 0 && ` (${reconnectAttempts.current}회)`}
      </span>
      {status === 'disconnected' && (
        <button
          onClick={handleReconnect}
          className="px-2 py-0.5 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
        >
          재연결
        </button>
      )}
    </div>
  );
} 