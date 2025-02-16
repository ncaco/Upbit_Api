import { useState, useEffect } from 'react';
import { WebSocketStatus } from '@/components/common/websocket-status';
import { Link } from 'react-router-dom';
export function Header() {
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleString());

  useEffect(() => {
    // 1초마다 시간 업데이트
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 및 메인 네비게이션 */}
          <div className="flex items-center">
            <Link to="/" className="text-[#093687] font-bold text-xl mr-8">
              UPBIT
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-900 hover:text-[#093687] px-3 py-2 text-sm font-medium">
                거래소
              </Link>
              <Link to="/trade" className="text-gray-500 hover:text-[#093687] px-3 py-2 text-sm font-medium">
                자동매매
              </Link>
              <Link to="/assets" className="text-gray-500 hover:text-[#093687] px-3 py-2 text-sm font-medium">
                투자내역
              </Link>
            </nav>
          </div>

          {/* 우측 상태 표시 */}
          <div className="flex items-center space-x-4">
            <WebSocketStatus />
            <div className="text-xs text-gray-500">
              {currentTime}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 