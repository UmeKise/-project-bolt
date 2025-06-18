import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { performanceOptimizer } from '../utils/PerformanceOptimizer';
import { securityEnhancer } from '../utils/SecurityEnhancer';

interface AppState {
  isInitialized: boolean;
  isDarkMode: boolean;
  language: string;
  notificationsEnabled: boolean;
  biometricsEnabled: boolean;
}

interface AppContextType {
  state: AppState;
  setDarkMode: (enabled: boolean) => Promise<void>;
  setLanguage: (language: string) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setBiometricsEnabled: (enabled: boolean) => Promise<void>;
  resetApp: () => Promise<void>;
}

const defaultState: AppState = {
  isInitialized: false,
  isDarkMode: false,
  language: 'ja',
  notificationsEnabled: true,
  biometricsEnabled: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);

  useEffect(() => {
    loadAppState();
  }, []);

  const loadAppState = async () => {
    try {
      const storedState = await AsyncStorage.getItem('appState');
      if (storedState) {
        setState(JSON.parse(storedState));
      }
    } catch (error) {
      console.error('Error loading app state:', error);
    }
  };

  const saveAppState = async (newState: AppState) => {
    try {
      await AsyncStorage.setItem('appState', JSON.stringify(newState));
      setState(newState);
    } catch (error) {
      console.error('Error saving app state:', error);
    }
  };

  const setDarkMode = async (enabled: boolean) => {
    const newState = { ...state, isDarkMode: enabled };
    await saveAppState(newState);
  };

  const setLanguage = async (language: string) => {
    const newState = { ...state, language };
    await saveAppState(newState);
  };

  const setNotificationsEnabled = async (enabled: boolean) => {
    const newState = { ...state, notificationsEnabled: enabled };
    await saveAppState(newState);
  };

  const setBiometricsEnabled = async (enabled: boolean) => {
    if (enabled) {
      const isAvailable = await securityEnhancer.checkBiometricAvailability();
      if (!isAvailable) {
        throw new Error('生体認証が利用できません');
      }
    }
    const newState = { ...state, biometricsEnabled: enabled };
    await saveAppState(newState);
  };

  const resetApp = async () => {
    try {
      await AsyncStorage.clear();
      await performanceOptimizer.clearCache();
      await securityEnhancer.resetSecurityMetrics();
      setState(defaultState);
    } catch (error) {
      console.error('Error resetting app:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        state,
        setDarkMode,
        setLanguage,
        setNotificationsEnabled,
        setBiometricsEnabled,
        resetApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}; 