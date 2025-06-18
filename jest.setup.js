import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

// グローバルなモック
global.fetch = jest.fn();

// タイマーのモック
jest.useFakeTimers();

// コンソールのエラーとワーニングを抑制
console.error = jest.fn();
console.warn = jest.fn();

// テスト用のユーティリティ関数
global.testUtils = {
  waitForElement: (callback) => {
    return new Promise((resolve) => {
      const check = () => {
        try {
          const result = callback();
          if (result) {
            resolve(result);
          } else {
            setTimeout(check, 100);
          }
        } catch (error) {
          setTimeout(check, 100);
        }
      };
      check();
    });
  },
  mockAsyncFunction: (data, delay = 1000) => {
    return jest.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(data);
        }, delay);
      });
    });
  },
  mockErrorFunction: (error, delay = 1000) => {
    return jest.fn().mockImplementation(() => {
      return new Promise((_, reject) => {
        setTimeout(() => {
          reject(error);
        }, delay);
      });
    });
  },
}; 