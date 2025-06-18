import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Bell, Mail, MessageSquare, Calendar } from 'lucide-react-native';

interface NotificationSettingsProps {
  settings: {
    pushNotifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    reservationReminders: boolean;
    newFacilities: boolean;
    specialOffers: boolean;
    reviewResponses: boolean;
  };
  onSettingChange: (setting: string, value: boolean) => void;
  onSave: () => void;
}

export default function NotificationSettings({
  settings,
  onSettingChange,
  onSave,
}: NotificationSettingsProps) {
  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    description: string,
    settingKey: string,
    value: boolean
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => onSettingChange(settingKey, newValue)}
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
          <Bell size={24} color="#4CAF50" />,
          'プッシュ通知',
          'アプリ内の通知を受け取ります',
          'pushNotifications',
          settings.pushNotifications
        )}
        {renderSettingItem(
          <Mail size={24} color="#4CAF50" />,
          'メール通知',
          'メールで通知を受け取ります',
          'emailNotifications',
          settings.emailNotifications
        )}
        {renderSettingItem(
          <MessageSquare size={24} color="#4CAF50" />,
          'SMS通知',
          'SMSで通知を受け取ります',
          'smsNotifications',
          settings.smsNotifications
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>通知内容</Text>
        {renderSettingItem(
          <Calendar size={24} color="#4CAF50" />,
          '予約リマインダー',
          '予約の前日に通知を受け取ります',
          'reservationReminders',
          settings.reservationReminders
        )}
        {renderSettingItem(
          <Bell size={24} color="#4CAF50" />,
          '新規施設',
          '新しい施設の追加通知を受け取ります',
          'newFacilities',
          settings.newFacilities
        )}
        {renderSettingItem(
          <Bell size={24} color="#4CAF50" />,
          '特別オファー',
          '特別な割引やキャンペーンの通知を受け取ります',
          'specialOffers',
          settings.specialOffers
        )}
        {renderSettingItem(
          <MessageSquare size={24} color="#4CAF50" />,
          'レビュー返信',
          'レビューへの返信通知を受け取ります',
          'reviewResponses',
          settings.reviewResponses
        )}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveButtonText}>設定を保存</Text>
      </TouchableOpacity>
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
    color: '#333',
    marginBottom: 16,
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
    marginRight: 16,
  },
  settingContent: {
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
  saveButton: {
    backgroundColor: '#4CAF50',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 