import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { riskManager } from '@/lib/risk-management/risk-manager';
import type { RiskManagementConfig, RiskStatus } from '@/types/risk-management';
import { formatNumber } from '@/lib/utils';

export function RiskManagementSettings() {
  const [config, setConfig] = useState<RiskManagementConfig>(riskManager.getConfig());
  const [status, setStatus] = useState<RiskStatus>(riskManager.getStatus());

  // 상태 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(riskManager.getStatus());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 설정 변경
  const handleConfigChange = (changes: Partial<RiskManagementConfig>) => {
    const newConfig = { ...config, ...changes };
    riskManager.updateConfig(newConfig);
    setConfig(newConfig);
  };

  return (
    <Card className="p-4">
      <h2 className="text-lg font-bold mb-4">위험 관리</h2>

      {/* 현재 상태 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">당일 손실</div>
          <div className="text-xl font-bold text-red-500">
            {formatNumber(status.dailyLoss)}원
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">당일 거래 횟수</div>
          <div className="text-xl font-bold">
            {status.dailyTradeCount}회
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">현재 낙폭</div>
          <div className="text-xl font-bold text-red-500">
            {status.currentDrawdown.toFixed(2)}%
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">거래 상태</div>
          <div className="text-xl font-bold">
            {status.isTradingAllowed ? (
              <span className="text-green-600">거래 가능</span>
            ) : (
              <span className="text-red-600">거래 중지</span>
            )}
          </div>
          {status.stopReason && (
            <div className="text-xs text-red-500 mt-1">
              {status.stopReason}
            </div>
          )}
        </div>
      </div>

      {/* 설정 */}
      <div className="space-y-4">
        <h3 className="font-medium">위험 관리 설정</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">
              일일 최대 손실 금액
            </label>
            <div className="flex items-center">
              <input
                type="number"
                value={config.maxDailyLoss}
                onChange={(e) => handleConfigChange({
                  maxDailyLoss: parseInt(e.target.value)
                })}
                className="block w-full text-sm"
              />
              <span className="ml-2 text-sm text-gray-500">원</span>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">
              최대 포지션 크기
            </label>
            <div className="flex items-center">
              <input
                type="number"
                value={config.maxPositionSize}
                onChange={(e) => handleConfigChange({
                  maxPositionSize: parseFloat(e.target.value)
                })}
                className="block w-full text-sm"
              />
              <span className="ml-2 text-sm text-gray-500">%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">
              일일 최대 거래 횟수
            </label>
            <div className="flex items-center">
              <input
                type="number"
                value={config.maxDailyTrades}
                onChange={(e) => handleConfigChange({
                  maxDailyTrades: parseInt(e.target.value)
                })}
                className="block w-full text-sm"
              />
              <span className="ml-2 text-sm text-gray-500">회</span>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">
              최대 낙폭
            </label>
            <div className="flex items-center">
              <input
                type="number"
                value={config.maxDrawdown}
                onChange={(e) => handleConfigChange({
                  maxDrawdown: parseFloat(e.target.value)
                })}
                className="block w-full text-sm"
              />
              <span className="ml-2 text-sm text-gray-500">%</span>
            </div>
          </div>
        </div>

        <label className="flex items-center space-x-2 mt-4">
          <input
            type="checkbox"
            checked={config.stopTradingOnMaxLoss}
            onChange={(e) => handleConfigChange({
              stopTradingOnMaxLoss: e.target.checked
            })}
          />
          <span className="text-sm">최대 손실 도달 시 거래 중지</span>
        </label>

        {/* 거래 재개 버튼 */}
        {!status.isTradingAllowed && (
          <div className="mt-4">
            <button
              onClick={() => riskManager.resumeTrading()}
              className="btn bg-blue-50 text-blue-600 hover:bg-blue-100"
            >
              거래 재개
            </button>
          </div>
        )}
      </div>
    </Card>
  );
} 