import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
} from 'react-native';
import { User, Settings, Baby, Heart, Bell, Volume2, VolumeX, Accessibility, MessageCircle, CircleHelp as HelpCircle, Share2 } from 'lucide-react-native';

export default function ProfileScreen() {
  const [settings, setSettings] = useState({
    notifications: true,
    soundEnabled: true,
    largeText: false,
    voiceReading: false,
    locationTracking: true,
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const childProfiles = [
    {
      id: 1,
      name: 'あかりちゃん',
      age: '3歳',
      conditions: ['発達障害', '食物アレルギー'],
      needs: ['専門スタッフ', 'アレルギー対応'],
    },
    {
      id: 2,
      name: 'たろうくん',
      age: '1歳2ヶ月',
      conditions: ['健常'],
      needs: ['授乳室', 'ベビーカー対応'],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>プロフィール</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={20} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* ユーザー情報 */}
        <View style={styles.section}>
          <View style={styles.userCard}>
            <View style={styles.userIcon}>
              <User size={32} color="#4A90E2" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>田中 花子</Text>
              <Text style={styles.userDescription}>2児の母</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>編集</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 子どもプロフィール */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Baby size={20} color="#FF9500" />
            <Text style={styles.sectionTitle}>お子様プロフィール</Text>
          </View>
          
          {childProfiles.map((child) => (
            <View key={child.id} style={styles.childCard}>
              <View style={styles.childHeader}>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childAge}>{child.age}</Text>
              </View>
              
              <View style={styles.conditionsContainer}>
                <Text style={styles.conditionsLabel}>特性・状況:</Text>
                <View style={styles.conditionTags}>
                  {child.conditions.map((condition, index) => (
                    <Text key={index} style={styles.conditionTag}>
                      {condition}
                    </Text>
                  ))}
                </View>
              </View>
              
              <View style={styles.needsContainer}>
                <Text style={styles.needsLabel}>必要な設備:</Text>
                <View style={styles.needTags}>
                  {child.needs.map((need, index) => (
                    <Text key={index} style={styles.needTag}>
                      {need}
                    </Text>
                  ))}
                </View>
              </View>
              
              <TouchableOpacity style={styles.editChildButton}>
                <Text style={styles.editChildButtonText}>プロフィール編集</Text>
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity style={styles.addChildButton}>
            <Text style={styles.addChildButtonText}>+ お子様を追加</Text>
          </TouchableOpacity>
        </View>

        {/* アプリ設定 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={20} color="#4A90E2" />
            <Text style={styles.sectionTitle}>アプリ設定</Text>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={20} color="#666" />
              <Text style={styles.settingLabel}>通知設定</Text>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={(value) => handleSettingChange('notifications', value)}
              trackColor={{ false: '#e0e0e0', true: '#4A90E2' }}
              thumbColor={settings.notifications ? '#fff' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              {settings.soundEnabled ? (
                <Volume2 size={20} color="#666" />
              ) : (
                <VolumeX size={20} color="#666" />
              )}
              <Text style={styles.settingLabel}>音声ON/OFF</Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(value) => handleSettingChange('soundEnabled', value)}
              trackColor={{ false: '#e0e0e0', true: '#4A90E2' }}
              thumbColor={settings.soundEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* アクセシビリティ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Accessibility size={20} color="#AF52DE" />
            <Text style={styles.sectionTitle}>アクセシビリティ</Text>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>Aa</Text>
              <Text style={styles.settingLabel}>大きな文字</Text>
            </View>
            <Switch
              value={settings.largeText}
              onValueChange={(value) => handleSettingChange('largeText', value)}
              trackColor={{ false: '#e0e0e0', true: '#4A90E2' }}
              thumbColor={settings.largeText ? '#fff' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MessageCircle size={20} color="#666" />
              <Text style={styles.settingLabel}>音声読み上げ</Text>
            </View>
            <Switch
              value={settings.voiceReading}
              onValueChange={(value) => handleSettingChange('voiceReading', value)}
              trackColor={{ false: '#e0e0e0', true: '#4A90E2' }}
              thumbColor={settings.voiceReading ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* サポート */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.supportItem}>
            <HelpCircle size={20} color="#4A90E2" />
            <Text style={styles.supportText}>ヘルプ・使い方</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.supportItem}>
            <Share2 size={20} color="#4A90E2" />
            <Text style={styles.supportText}>アプリを友達に紹介</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.supportItem}>
            <Heart size={20} color="#FF3B30" />
            <Text style={styles.supportText}>レビューを書く</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsButton: {
    padding: 8,
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  userIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userDescription: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  childCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  childHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  childName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  childAge: {
    fontSize: 14,
    color: '#666',
  },
  conditionsContainer: {
    marginBottom: 10,
  },
  conditionsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  conditionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  conditionTag: {
    fontSize: 11,
    backgroundColor: '#fff0e6',
    color: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  needsContainer: {
    marginBottom: 12,
  },
  needsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  needTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  needTag: {
    fontSize: 11,
    backgroundColor: '#f0f7ff',
    color: '#4A90E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  editChildButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
  },
  editChildButtonText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
  },
  addChildButton: {
    marginHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addChildButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    width: 20,
    textAlign: 'center',
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  supportText: {
    fontSize: 16,
    color: '#333',
  },
});