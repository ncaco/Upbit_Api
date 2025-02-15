import { WebSocketStatus } from '@/components/common/websocket-status';

export function Header() {
  return (
    <header className="bg-[#093687] text-white p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Upbit</h1>
        <div className="flex items-center gap-4">
          <WebSocketStatus />
          <span className="text-sm opacity-80">최근 업데이트: {new Date().toLocaleString()}</span>
        </div>
      </div>
    </header>
  );
} 