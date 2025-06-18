import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Home, History, Settings, MessageCircle } from 'lucide-react-native';
import { CancellationHistory } from './CancellationHistory';
import { CancellationPolicyManager } from './CancellationPolicyManager';
import { CancellationFeeReport } from './CancellationFeeReport';
import { ChatSupport } from './ChatSupport';
import { FeedbackList } from './FeedbackList';

const Tab = createBottomTabNavigator();

export const MainNavigation: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: '#E0E0E0',
            backgroundColor: '#fff',
          },
          headerStyle: {
            backgroundColor: '#fff',
            borderBottomWidth: 1,
            borderBottomColor: '#E0E0E0',
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#333',
          },
        }}
      >
        <Tab.Screen
          name="History"
          component={CancellationHistory}
          options={{
            title: 'キャンセル履歴',
            tabBarIcon: ({ color, size }) => (
              <History size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Policy"
          component={CancellationPolicyManager}
          options={{
            title: 'ポリシー管理',
            tabBarIcon: ({ color, size }) => (
              <Settings size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Report"
          component={CancellationFeeReport}
          options={{
            title: 'レポート',
            tabBarIcon: ({ color, size }) => (
              <Home size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Chat"
          component={ChatSupport}
          options={{
            title: 'サポート',
            tabBarIcon: ({ color, size }) => (
              <MessageCircle size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Feedback"
          component={FeedbackList}
          options={{
            title: 'フィードバック',
            tabBarIcon: ({ color, size }) => (
              <MessageCircle size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}; 