import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { CancellationRecord } from '../types/cancellation';

interface ReminderConfig {
  enabled: boolean;
  timing: {
    beforePayment: number; // 支払い期限の何時間前に通知するか
    beforePolicyChange: number; // ポリシー変更の何時間前に通知するか
  };
  notificationTypes: {
    payment: boolean;
    policyChange: boolean;
    upcomingCancellation: boolean;
  };
}

class ReminderService {
  private static instance: ReminderService;
  private config: ReminderConfig = {
    enabled: true,
    timing: {
      beforePayment: 24,
      beforePolicyChange: 48,
    },
    notificationTypes: {
      payment: true,
      policyChange: true,
      upcomingCancellation: true,
    },
  };

  private constructor() {
    this.setupNotifications();
  }

  static getInstance(): ReminderService {
    if (!ReminderService.instance) {
      ReminderService.instance = new ReminderService();
    }
    return ReminderService.instance;
  }

  private async setupNotifications(): Promise<void> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        throw new Error('通知の許可が得られませんでした');
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    } catch (error) {
      console.error('Failed to setup notifications:', error);
      throw new Error('通知の設定に失敗しました');
    }
  }

  async schedulePaymentReminder(record: CancellationRecord): Promise<void> {
    try {
      if (!this.config.enabled || !this.config.notificationTypes.payment) {
        return;
      }

      const paymentDate = new Date(record.paymentDueDate);
      const reminderDate = new Date(
        paymentDate.getTime() - this.config.timing.beforePayment * 60 * 60 * 1000
      );

      if (reminderDate > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '支払い期限のリマインダー',
            body: `${record.facilityName}のキャンセル料金の支払い期限が近づいています。\n支払い期限: ${paymentDate.toLocaleDateString()}\n金額: ¥${record.cancellationFee.toLocaleString()}`,
            data: { recordId: record.id },
          },
          trigger: reminderDate,
        });
      }
    } catch (error) {
      console.error('Failed to schedule payment reminder:', error);
      throw new Error('支払いリマインダーの設定に失敗しました');
    }
  }

  async schedulePolicyChangeReminder(
    policyName: string,
    effectiveDate: Date
  ): Promise<void> {
    try {
      if (!this.config.enabled || !this.config.notificationTypes.policyChange) {
        return;
      }

      const reminderDate = new Date(
        effectiveDate.getTime() -
          this.config.timing.beforePolicyChange * 60 * 60 * 1000
      );

      if (reminderDate > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'キャンセルポリシーの変更通知',
            body: `${policyName}のキャンセルポリシーが変更されます。\n変更日: ${effectiveDate.toLocaleDateString()}`,
            data: { policyName },
          },
          trigger: reminderDate,
        });
      }
    } catch (error) {
      console.error('Failed to schedule policy change reminder:', error);
      throw new Error('ポリシー変更リマインダーの設定に失敗しました');
    }
  }

  async scheduleUpcomingCancellationReminder(
    record: CancellationRecord
  ): Promise<void> {
    try {
      if (!this.config.enabled || !this.config.notificationTypes.upcomingCancellation) {
        return;
      }

      const cancellationDate = new Date(record.cancellationDate);
      const reminderDate = new Date(
        cancellationDate.getTime() - 24 * 60 * 60 * 1000
      );

      if (reminderDate > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'キャンセル予定のリマインダー',
            body: `${record.facilityName}のキャンセルが予定されています。\nキャンセル日: ${cancellationDate.toLocaleDateString()}\nキャンセル料金: ¥${record.cancellationFee.toLocaleString()}`,
            data: { recordId: record.id },
          },
          trigger: reminderDate,
        });
      }
    } catch (error) {
      console.error('Failed to schedule upcoming cancellation reminder:', error);
      throw new Error('キャンセル予定リマインダーの設定に失敗しました');
    }
  }

  async updateConfig(newConfig: Partial<ReminderConfig>): Promise<void> {
    try {
      this.config = { ...this.config, ...newConfig };
    } catch (error) {
      console.error('Failed to update reminder config:', error);
      throw new Error('リマインダー設定の更新に失敗しました');
    }
  }

  async getConfig(): Promise<ReminderConfig> {
    return this.config;
  }

  async cancelAllReminders(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel all reminders:', error);
      throw new Error('リマインダーのキャンセルに失敗しました');
    }
  }
}

export default ReminderService; 