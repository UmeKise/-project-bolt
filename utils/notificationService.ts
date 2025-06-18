import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { CancellationRecord } from '../types/cancellation';

// 通知の設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// 通知の権限をリクエスト
export const requestNotificationPermission = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
};

// キャンセル通知を送信
export const sendCancellationNotification = async (
  cancellation: CancellationRecord
): Promise<void> => {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.log('通知の権限がありません');
    return;
  }

  const title = '予約がキャンセルされました';
  const body = `${cancellation.facilityName}の予約がキャンセルされました。\nキャンセル料金: ¥${cancellation.cancellationFee.toLocaleString()}`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { cancellation },
    },
    trigger: null, // 即時通知
  });
};

// キャンセル料金の支払い期限通知を送信
export const sendPaymentDueNotification = async (
  cancellation: CancellationRecord,
  dueDate: Date
): Promise<void> => {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.log('通知の権限がありません');
    return;
  }

  const title = 'キャンセル料金の支払い期限が近づいています';
  const body = `${cancellation.facilityName}のキャンセル料金（¥${cancellation.cancellationFee.toLocaleString()}）の支払い期限が近づいています。`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { cancellation, dueDate },
    },
    trigger: {
      date: new Date(dueDate.getTime() - 24 * 60 * 60 * 1000), // 24時間前
    },
  });
};

// キャンセルポリシーの変更通知を送信
export const sendPolicyChangeNotification = async (
  facilityName: string,
  changes: string
): Promise<void> => {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.log('通知の権限がありません');
    return;
  }

  const title = 'キャンセルポリシーが変更されました';
  const body = `${facilityName}のキャンセルポリシーが変更されました。\n${changes}`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { facilityName, changes },
    },
    trigger: null, // 即時通知
  });
};

// 通知の購読を設定
export const setupNotificationSubscription = (
  onNotificationReceived: (notification: Notifications.Notification) => void
): (() => void) => {
  const subscription = Notifications.addNotificationReceivedListener(
    onNotificationReceived
  );

  return () => {
    subscription.remove();
  };
};

// 通知のバッジをリセット
export const resetNotificationBadge = async (): Promise<void> => {
  await Notifications.setBadgeCountAsync(0);
};

// 通知の設定を取得
export const getNotificationSettings = async (): Promise<Notifications.NotificationPermissionsStatus> => {
  return await Notifications.getPermissionsAsync();
};

// 通知の設定を更新
export const updateNotificationSettings = async (
  settings: Partial<Notifications.NotificationPermissionsStatus>
): Promise<void> => {
  if (Platform.OS === 'ios') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'デフォルト',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}; 