import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { UserProvider } from '../../contexts/UserContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { AppProvider } from '../../contexts/AppContext';
import { mockUser } from '../mocks/mockData';

interface AllTheProvidersProps {
  children: React.ReactNode;
  user?: typeof mockUser;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({
  children,
  user = mockUser,
}) => {
  return (
    <ThemeProvider>
      <AppProvider>
        <UserProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </UserProvider>
      </AppProvider>
    </ThemeProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options = {}
) => {
  return render(ui, { wrapper: AllTheProviders, ...options });
};

// モック関数の作成
const mockAsyncFunction = <T,>(data: T, delay = 1000) => {
  return jest.fn().mockImplementation(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(data);
      }, delay);
    });
  });
};

const mockErrorFunction = (error: Error, delay = 1000) => {
  return jest.fn().mockImplementation(() => {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(error);
      }, delay);
    });
  });
};

// テスト用のユーティリティ関数
const waitForElement = async (callback: () => void) => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  callback();
};

const generateTestId = (prefix: string) => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

// テスト用のカスタムフック
const useTestHook = () => {
  const [value, setValue] = React.useState(0);
  const increment = () => setValue((prev) => prev + 1);
  const decrement = () => setValue((prev) => prev - 1);
  return { value, increment, decrement };
};

// テスト用のコンポーネント
const TestComponent: React.FC<{ onPress?: () => void }> = ({ onPress }) => {
  return (
    <div onClick={onPress} data-testid="test-component">
      Test Component
    </div>
  );
};

export {
  customRender,
  mockAsyncFunction,
  mockErrorFunction,
  waitForElement,
  generateTestId,
  useTestHook,
  TestComponent,
}; 