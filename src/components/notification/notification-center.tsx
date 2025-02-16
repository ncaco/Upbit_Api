import { useState, useEffect } from 'react';
import { Bell, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { notificationService } from '@/lib/notification/notification-service';
import type { Notification, NotificationPreferences } from '@/types/notification';

const NOTIFICATION_ICONS = {
  TRADE: '💰',
  PROFIT: '📈',
  ERROR: '⚠️',
  SYSTEM: '🔔'
};

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    notificationService.getPreferences()
  );
  const [showPreferences, setShowPreferences] = useState(false);

  // 알림 목록 업데이트
  useEffect(() => {
    const updateNotifications = () => {
      setNotifications(notificationService.getNotifications());
    };

    // 초기 로드
    updateNotifications();

    // 1초마다 업데이트
    const interval = setInterval(updateNotifications, 1000);
    return () => clearInterval(interval);
  }, []);

  // 알림 읽음 처리
  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
    setNotifications(notificationService.getNotifications());
  };

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
    setNotifications(notificationService.getNotifications());
  };

  // 알림 삭제
  const handleDelete = (id: string) => {
    notificationService.deleteNotification(id);
    setNotifications(notificationService.getNotifications());
  };

  // 알림 설정 업데이트
  const handlePreferencesChange = (newPreferences: Partial<NotificationPreferences>) => {
    notificationService.updatePreferences(newPreferences);
    setPreferences(notificationService.getPreferences());
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      {/* 알림 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 text-xs text-white bg-red-500 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 알림 패널 */}
      {isOpen && (
        <Card className="absolute right-0 mt-2 w-96 max-h-[80vh] overflow-y-auto z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">알림</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <Settings className="w-5 h-5" />
                </button>
                {notifications.length > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    모두 읽음 처리
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 알림 설정 */}
          {showPreferences && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-medium mb-3">알림 설정</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences.enableTradeNotifications}
                    onChange={(e) => handlePreferencesChange({
                      enableTradeNotifications: e.target.checked
                    })}
                  />
                  <span>거래 알림</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences.enableProfitNotifications}
                    onChange={(e) => handlePreferencesChange({
                      enableProfitNotifications: e.target.checked
                    })}
                  />
                  <span>수익/손실 알림</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences.enableErrorNotifications}
                    onChange={(e) => handlePreferencesChange({
                      enableErrorNotifications: e.target.checked
                    })}
                  />
                  <span>에러 알림</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">최소 수익 알림 (%)</label>
                    <input
                      type="number"
                      value={preferences.minProfitThreshold}
                      onChange={(e) => handlePreferencesChange({
                        minProfitThreshold: parseFloat(e.target.value)
                      })}
                      className="w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">최대 손실 알림 (%)</label>
                    <input
                      type="number"
                      value={preferences.maxLossThreshold}
                      onChange={(e) => handlePreferencesChange({
                        maxLossThreshold: parseFloat(e.target.value)
                      })}
                      className="w-full text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 알림 목록 */}
          <div className="divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                알림이 없습니다
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-xl">
                      {NOTIFICATION_ICONS[notification.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium truncate pr-4">
                          {notification.title}
                        </h3>
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            읽음 처리
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
} 