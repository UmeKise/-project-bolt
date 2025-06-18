import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

interface NotificationData {
  title: string;
  body: string;
  data?: any;
}

interface EmailData {
  to: string;
  subject: string;
  body: string;
}

// プッシュ通知の設定
export const configurePushNotifications = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
};

// プッシュ通知を送信
export const sendPushNotification = async (data: NotificationData) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: data.title,
        body: data.body,
        data: data.data || {},
      },
      trigger: null,
    });
    return true;
  } catch (error) {
    console.error('プッシュ通知の送信に失敗しました:', error);
    return false;
  }
};

// メール通知を送信
export const sendEmailNotification = async (data: EmailData) => {
  try {
    // メール送信の実装（例：SendGrid、AWS SES等を使用）
    // この例では実装を省略
    console.log('メール送信:', data);
    return true;
  } catch (error) {
    console.error('メール通知の送信に失敗しました:', error);
    return false;
  }
};

// 予約確認通知を送信
export const sendReservationConfirmation = async (
  reservation: {
    id: string;
    facilityName: string;
    date: Date;
    time: string;
    numberOfPeople: number;
  },
  notificationSettings: {
    email: { enabled: boolean; address: string };
    push: { enabled: boolean };
  }
) => {
  const notificationData = {
    title: '予約が完了しました',
    body: `${reservation.facilityName}の予約が完了しました。\n日時: ${reservation.date.toLocaleDateString()} ${reservation.time}\n人数: ${reservation.numberOfPeople}名`,
    data: { reservationId: reservation.id },
  };

  const emailData = {
    to: notificationSettings.email.address,
    subject: '予約確認',
    body: `
      ${reservation.facilityName}の予約が完了しました。

      予約内容:
      日時: ${reservation.date.toLocaleDateString()} ${reservation.time}
      人数: ${reservation.numberOfPeople}名

      予約の詳細はアプリでご確認ください。
    `,
  };

  const results = await Promise.all([
    notificationSettings.push.enabled
      ? sendPushNotification(notificationData)
      : Promise.resolve(false),
    notificationSettings.email.enabled
      ? sendEmailNotification(emailData)
      : Promise.resolve(false),
  ]);

  return results.some((result) => result);
};

// 予約リマインダー通知を送信
export const sendReservationReminder = async (
  reservation: {
    id: string;
    facilityName: string;
    date: Date;
    time: string;
    numberOfPeople: number;
  },
  notificationSettings: {
    email: { enabled: boolean; address: string };
    push: { enabled: boolean };
  }
) => {
  const notificationData = {
    title: '予約のリマインダー',
    body: `明日${reservation.facilityName}の予約があります。\n日時: ${reservation.date.toLocaleDateString()} ${reservation.time}\n人数: ${reservation.numberOfPeople}名`,
    data: { reservationId: reservation.id },
  };

  const emailData = {
    to: notificationSettings.email.address,
    subject: '予約のリマインダー',
    body: `
      ${reservation.facilityName}の予約が明日あります。

      予約内容:
      日時: ${reservation.date.toLocaleDateString()} ${reservation.time}
      人数: ${reservation.numberOfPeople}名

      予約の詳細はアプリでご確認ください。
    `,
  };

  const results = await Promise.all([
    notificationSettings.push.enabled
      ? sendPushNotification(notificationData)
      : Promise.resolve(false),
    notificationSettings.email.enabled
      ? sendEmailNotification(emailData)
      : Promise.resolve(false),
  ]);

  return results.some((result) => result);
};

// 予約キャンセル通知を送信
export const sendReservationCancellation = async (
  reservation: {
    id: string;
    facilityName: string;
    date: Date;
    time: string;
    numberOfPeople: number;
  },
  notificationSettings: {
    email: { enabled: boolean; address: string };
    push: { enabled: boolean };
  }
) => {
  const notificationData = {
    title: '予約がキャンセルされました',
    body: `${reservation.facilityName}の予約がキャンセルされました。\n日時: ${reservation.date.toLocaleDateString()} ${reservation.time}\n人数: ${reservation.numberOfPeople}名`,
    data: { reservationId: reservation.id },
  };

  const emailData = {
    to: notificationSettings.email.address,
    subject: '予約のキャンセル',
    body: `
      ${reservation.facilityName}の予約がキャンセルされました。

      キャンセルされた予約内容:
      日時: ${reservation.date.toLocaleDateString()} ${reservation.time}
      人数: ${reservation.numberOfPeople}名

      ご不明な点がございましたら、お問い合わせください。
    `,
  };

  const results = await Promise.all([
    notificationSettings.push.enabled
      ? sendPushNotification(notificationData)
      : Promise.resolve(false),
    notificationSettings.email.enabled
      ? sendEmailNotification(emailData)
      : Promise.resolve(false),
  ]);

  return results.some((result) => result);
}; 