import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
} from 'react-native';
import { Bell, ChevronRight } from 'lucide-react-native';

interface NotificationSettings {
  email: {
    enabled: boolean;
    address: string;
  };
  push: {
    enabled: boolean;
  };
  reminders: {
    enabled: boolean;
    daysBefore: number;
  };
}

interface NotificationManagerProps {
  initialSettings: NotificationSettings;
  onSave: (settings: NotificationSettings) => void;
}

export default function NotificationManager({
  initialSettings,
  onSave,
}: NotificationManagerProps) {
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings);

  const handleEmailToggle = () => {
    setSettings((prev) => ({
      ...prev,
      email: {
        ...prev.email,
        enabled: !prev.email.enabled,
      },
    }));
  };

  const handlePushToggle = () => {
    setSettings((prev) => ({
      ...prev,
      push: {
        ...prev.push,
        enabled: !prev.push.enabled,
      },
    }));
  };

  const handleRemindersToggle = () => {
    setSettings((prev) => ({
      ...prev,
      reminders: {
        ...prev.reminders,
        enabled: !prev.reminders.enabled,
      },
    }));
  };

  const handleEmailChange = (value: string) => {
    setSettings((prev) => ({
      ...prev,
      email: {
        ...prev.email,
        address: value,
      },
    }));
  };

  const handleDaysBeforeChange = (value: string) => {
    const days = parseInt(value) || 0;
    setSettings((prev) => ({
      ...prev,
      reminders: {
        ...prev.reminders,
        daysBefore: days,
      },
    }));
  };

  const handleSave = () => {
    onSave(settings);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color="#666" />
            <Text style={styles.sectionTitle}>通知設定</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>メール通知</Text>
              <Text style={styles.settingDescription}>
                予約確認や変更通知をメールで受け取ります
              </Text>
            </View>
            <Switch
              value={settings.email.enabled}
              onValueChange={handleEmailToggle}
            />
          </View>

          {settings.email.enabled && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={settings.email.address}
                onChangeText={handleEmailChange}
                placeholder="メールアドレス"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>プッシュ通知</Text>
              <Text style={styles.settingDescription}>
                予約確認や変更通知をプッシュ通知で受け取ります
              </Text>
            </View>
            <Switch
              value={settings.push.enabled}
              onValueChange={handlePushToggle}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>予約リマインダー</Text>
              <Text style={styles.settingDescription}>
                予約日前にリマインダー通知を受け取ります
              </Text>
            </View>
            <Switch
              value={settings.reminders.enabled}
              onValueChange={handleRemindersToggle}
            />
          </View>

          {settings.reminders.enabled && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={settings.reminders.daysBefore.toString()}
                onChangeText={handleDaysBeforeChange}
                placeholder="予約日前の日数"
                keyboardType="number-pad"
              />
              <Text style={styles.inputSuffix}>日前</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>保存</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    fontSize: 16,
  },
  inputSuffix: {
    position: 'absolute',
    right: 12,
    top: 12,
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    margin: 20,
    padding: 16,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 