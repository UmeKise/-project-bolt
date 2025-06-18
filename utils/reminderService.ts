import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { CancellationRecord } from '../types/cancellation';

// リマインダーの種類
export type ReminderType =
  | 'payment_due'
  | 'policy_change'
  | 'cancellation_deadline'
  | 'custom';

interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  body: string;
  scheduledTime: Date;
  data?: Record<string, any>;
}

// リマインダーをスケジュール
export const scheduleReminder = async (
  reminder: Omit<Reminder, 'id'>
): Promise<string> => {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.body,
        data: reminder.data || {},
      },
      trigger: {
        date: reminder.scheduledTime,
      },
    });

    // リマインダーを保存
    await saveReminder({
      ...reminder,
      id,
    });

    return id;
  } catch (error) {
    console.error('リマインダーのスケジュールに失敗しました:', error);
    throw new Error('リマインダーのスケジュールに失敗しました');
  }
};

// リマインダーを保存
const saveReminder = async (reminder: Reminder): Promise<void> => {
  try {
    const key = `reminder_${reminder.id}`;
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (error) {
    console.error('リマインダーの保存に失敗しました:', error);
    throw new Error('リマインダーの保存に失敗しました');
  }
};

// リマインダーをキャンセル
export const cancelReminder = async (id: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    console.error('リマインダーのキャンセルに失敗しました:', error);
    throw new Error('リマインダーのキャンセルに失敗しました');
  }
};

// 支払い期限のリマインダーを設定
export const schedulePaymentReminder = async (
  cancellation: CancellationRecord,
  daysBefore: number = 1
): Promise<string> => {
  const dueDate = new Date(cancellation.cancellationDate);
  dueDate.setDate(dueDate.getDate() + daysBefore);

  return scheduleReminder({
    type: 'payment_due',
    title: '支払い期限が近づいています',
    body: `${cancellation.facilityName}のキャンセル料金${cancellation.cancellationFee}円の支払い期限が${daysBefore}日後に迫っています。`,
    scheduledTime: dueDate,
    data: {
      cancellationId: cancellation.id,
      amount: cancellation.cancellationFee,
    },
  });
};

// キャンセル期限のリマインダーを設定
export const scheduleCancellationDeadlineReminder = async (
  reservationDate: Date,
  facilityName: string,
  hoursBefore: number = 24
): Promise<string> => {
  const deadline = new Date(reservationDate);
  deadline.setHours(deadline.getHours() - hoursBefore);

  return scheduleReminder({
    type: 'cancellation_deadline',
    title: 'キャンセル期限が近づいています',
    body: `${facilityName}の予約のキャンセル期限が${hoursBefore}時間後に迫っています。`,
    scheduledTime: deadline,
    data: {
      facilityName,
      reservationDate,
    },
  });
};

// ポリシー変更のリマインダーを設定
export const schedulePolicyChangeReminder = async (
  facilityName: string,
  effectiveDate: Date
): Promise<string> => {
  return scheduleReminder({
    type: 'policy_change',
    title: 'キャンセルポリシーが変更されます',
    body: `${facilityName}のキャンセルポリシーが${effectiveDate.toLocaleDateString()}から変更されます。`,
    scheduledTime: effectiveDate,
    data: {
      facilityName,
      effectiveDate,
    },
  });
};

// カスタムリマインダーを設定
export const scheduleCustomReminder = async (
  title: string,
  body: string,
  scheduledTime: Date,
  data?: Record<string, any>
): Promise<string> => {
  return scheduleReminder({
    type: 'custom',
    title,
    body,
    scheduledTime,
    data,
  });
};

// リマインダーの権限を確認
export const checkReminderPermission = async (): Promise<boolean> => {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
};

// リマインダーの権限を要求
export const requestReminderPermission = async (): Promise<boolean> => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

// リマインダーの設定を取得
export const getReminderSettings = async (): Promise<{
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
}> => {
  try {
    const settings = await Notifications.getPermissionsAsync();
    return {
      enabled: settings.status === 'granted',
      sound: true,
      vibration: Platform.OS === 'android',
    };
  } catch (error) {
    console.error('リマインダー設定の取得に失敗しました:', error);
    return {
      enabled: false,
      sound: true,
      vibration: Platform.OS === 'android',
    };
  }
}; 