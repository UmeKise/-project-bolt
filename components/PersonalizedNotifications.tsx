import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { notificationService } from '../services/notificationService';
import { extendedIntegrationService } from '../services/ExtendedIntegrationService';
import { CancellationRecord } from '../types/cancellation';

interface NotificationPreferences {
  cancellationNotifications: boolean;
  paymentReminders: boolean;
  policyUpdates: boolean;
  preferredTime: string;
  preferredDays: string[];
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export const PersonalizedNotifications: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    cancellationNotifications: true,
    paymentReminders: true,
    policyUpdates: true,
    preferredTime: '09:00',
    preferredDays: ['monday', 'wednesday', 'friday'],
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00',
    },
  });

  const [loading, setLoading] = useState(true);
  const [notificationHistory, setNotificationHistory] = useState<CancellationRecord[]>([]);

  useEffect(() => {
    loadPreferences();
    loadNotificationHistory();
  }, []);

  const loadPreferences = async () => {
    try {
      const storedPreferences = await notificationService.getNotificationSettings();
      if (storedPreferences) {
        setPreferences(storedPreferences);
      }
    } catch (error) {
      console.error('通知設定の読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationHistory = async () => {
    try {
      const history = await extendedIntegrationService.getNotificationHistory();
      setNotificationHistory(history);
    } catch (error) {
      console.error('通知履歴の読み込みに失敗しました:', error);
    }
  };

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean | string | string[]) => {
    try {
      const updatedPreferences = { ...preferences, [key]: value };
      setPreferences(updatedPreferences);
      await notificationService.updateNotificationSettings(updatedPreferences);
    } catch (error) {
      console.error('通知設定の更新に失敗しました:', error);
    }
  };

  const handleQuietHoursChange = async (key: keyof NotificationPreferences['quietHours'], value: boolean | string) => {
    try {
      const updatedQuietHours = { ...preferences.quietHours, [key]: value };
      const updatedPreferences = { ...preferences, quietHours: updatedQuietHours };
      setPreferences(updatedPreferences);
      await notificationService.updateNotificationSettings(updatedPreferences);
    } catch (error) {
      console.error('通知設定の更新に失敗しました:', error);
    }
  };

  const handleDayToggle = async (day: string) => {
    try {
      const updatedDays = preferences.preferredDays.includes(day)
        ? preferences.preferredDays.filter((d: string) => d !== day)
        : [...preferences.preferredDays, day];
      
      const updatedPreferences = { ...preferences, preferredDays: updatedDays };
      setPreferences(updatedPreferences);
      await notificationService.updateNotificationSettings(updatedPreferences);
    } catch (error) {
      console.error('通知設定の更新に失敗しました:', error);
    }
  };

  const renderDayToggle = (day: string, label: string) => (
    <TouchableOpacity
      style={[
        styles.dayToggle,
        preferences.preferredDays.includes(day) && styles.dayToggleActive,
      ]}
      onPress={() => handleDayToggle(day)}
    >
      <Text
        style={[
          styles.dayToggleText,
          preferences.preferredDays.includes(day) && styles.dayToggleTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>通知の種類</Text>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>キャンセル通知</Text>
          <Switch
            value={preferences.cancellationNotifications}
            onValueChange={(value) => handlePreferenceChange('cancellationNotifications', value)}
          />
        </View>

        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>支払いリマインダー</Text>
          <Switch
            value={preferences.paymentReminders}
            onValueChange={(value) => handlePreferenceChange('paymentReminders', value)}
          />
        </View>

        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>ポリシー更新通知</Text>
          <Switch
            value={preferences.policyUpdates}
            onValueChange={(value) => handlePreferenceChange('policyUpdates', value)}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>通知のタイミング</Text>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>希望時間</Text>
          <Picker
            selectedValue={preferences.preferredTime}
            onValueChange={(value) => handlePreferenceChange('preferredTime', value)}
            style={styles.picker}
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <Picker.Item
                key={i}
                label={`${i.toString().padStart(2, '0')}:00`}
                value={`${i.toString().padStart(2, '0')}:00`}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>希望曜日</Text>
          <View style={styles.daysContainer}>
            {renderDayToggle('monday', '月')}
            {renderDayToggle('tuesday', '火')}
            {renderDayToggle('wednesday', '水')}
            {renderDayToggle('thursday', '木')}
            {renderDayToggle('friday', '金')}
            {renderDayToggle('saturday', '土')}
            {renderDayToggle('sunday', '日')}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>おやすみモード</Text>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>おやすみモードを有効にする</Text>
          <Switch
            value={preferences.quietHours.enabled}
            onValueChange={(value) => handleQuietHoursChange('enabled', value)}
          />
        </View>

        {preferences.quietHours.enabled && (
          <>
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>開始時間</Text>
              <Picker
                selectedValue={preferences.quietHours.start}
                onValueChange={(value) => handleQuietHoursChange('start', value)}
                style={styles.picker}
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <Picker.Item
                    key={i}
                    label={`${i.toString().padStart(2, '0')}:00`}
                    value={`${i.toString().padStart(2, '0')}:00`}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>終了時間</Text>
              <Picker
                selectedValue={preferences.quietHours.end}
                onValueChange={(value) => handleQuietHoursChange('end', value)}
                style={styles.picker}
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <Picker.Item
                    key={i}
                    label={`${i.toString().padStart(2, '0')}:00`}
                    value={`${i.toString().padStart(2, '0')}:00`}
                  />
                ))}
              </Picker>
            </View>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>最近の通知</Text>
        {notificationHistory.map((record) => (
          <View key={record.id} style={styles.notificationItem}>
            <Text style={styles.notificationTitle}>
              {record.facilityName}のキャンセル
            </Text>
            <Text style={styles.notificationTime}>
              {format(new Date(record.cancelledAt), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
            </Text>
            <Text style={styles.notificationReason}>理由: {record.reason}</Text>
            <Text style={styles.notificationFee}>キャンセル料: ¥{record.fee.toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#333',
  },
  picker: {
    width: 120,
    height: 40,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dayToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayToggleActive: {
    backgroundColor: '#007AFF',
  },
  dayToggleText: {
    fontSize: 14,
    color: '#666',
  },
  dayToggleTextActive: {
    color: '#fff',
  },
  notificationItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  notificationReason: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notificationFee: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
}); 