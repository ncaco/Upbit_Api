export type NotificationType = 'TRADE' | 'PROFIT' | 'ERROR' | 'SYSTEM';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

export interface NotificationPreferences {
  enableTradeNotifications: boolean;    // 거래 알림
  enableProfitNotifications: boolean;   // 수익/손실 알림
  enableErrorNotifications: boolean;    // 에러 알림
  minProfitThreshold: number;          // 최소 수익 알림 기준 (%)
  maxLossThreshold: number;            // 최대 손실 알림 기준 (%)
} 