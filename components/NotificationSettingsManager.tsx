import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Bell, Mail, MessageSquare } from 'lucide-react-native';

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  reservationReminders: boolean;
  facilityUpdates: boolean;
  promotionalOffers: boolean;
}

interface NotificationSettingsManagerProps {
  settings: NotificationSettings;
  onSettingsChange: (settings: NotificationSettings) => void;
}

export default function NotificationSettingsManager({
  settings,
  onSettingsChange,
}: NotificationSettingsManagerProps) {
  const toggleSetting = (key: keyof NotificationSettings) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key],
    });
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    description: string,
    key: keyof NotificationSettings
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={settings[key]}
        onValueChange={() => toggleSetting(key)}
        trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>通知方法</Text>
        {renderSettingItem(
          <Mail size={24} color="#666" />,
          'メール通知',
          '予約確認や施設からのお知らせをメールで受け取ります',
          'emailNotifications'
        )}
        {renderSettingItem(
          <Bell size={24} color="#666" />,
          'プッシュ通知',
          'アプリからの通知を受け取ります',
          'pushNotifications'
        )}
        {renderSettingItem(
          <MessageSquare size={24} color="#666" />,
          'SMS通知',
          '予約確認や重要な通知をSMSで受け取ります',
          'smsNotifications'
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>通知内容</Text>
        {renderSettingItem(
          <Bell size={24} color="#666" />,
          '予約リマインダー',
          '予約日の前日にリマインダーを受け取ります',
          'reservationReminders'
        )}
        {renderSettingItem(
          <Bell size={24} color="#666" />,
          '施設からのお知らせ',
          '営業時間変更やメンテナンス情報を受け取ります',
          'facilityUpdates'
        )}
        {renderSettingItem(
          <Bell size={24} color="#666" />,
          'プロモーション情報',
          '特別割引やキャンペーン情報を受け取ります',
          'promotionalOffers'
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
}); 