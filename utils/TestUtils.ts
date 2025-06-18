import { render, RenderOptions } from '@testing-library/react-native';
import { ThemeProvider } from '../contexts/ThemeContext';
import { UserProvider } from '../contexts/UserContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import React, { ReactElement } from 'react';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: 'light' | 'dark';
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  notifications?: boolean;
}

const AllTheProviders = ({
  children,
  theme = 'light',
  user,
  notifications = true,
}: {
  children: React.ReactNode;
  theme?: 'light' | 'dark';
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  notifications?: boolean;
}) => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UserProvider>
          {notifications && <NotificationProvider>{children}</NotificationProvider>}
          {!notifications && children}
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  return render(ui, {
    wrapper: (props) => (
      <AllTheProviders
        {...props}
        theme={options?.theme}
        user={options?.user}
        notifications={options?.notifications}
      />
    ),
    ...options,
  });
};

// モックデータ
export const mockUser = {
  id: '1',
  name: 'テストユーザー',
  email: 'test@example.com',
  role: 'user',
};

export const mockCancellationRecord = {
  id: '1',
  userId: '1',
  amount: 1000,
  reason: 'テスト理由',
  timestamp: new Date().toISOString(),
  status: 'pending',
};

export const mockCancellationPolicy = {
  id: '1',
  name: 'テストポリシー',
  rules: [
    {
      condition: 'amount > 1000',
      action: 'require_approval',
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// テストヘルパー関数
export const waitForElement = async (
  callback: () => void,
  timeout = 1000
): Promise<void> => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      callback();
      return;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  throw new Error('要素が見つかりませんでした');
};

export const mockAsyncFunction = <T>(
  data: T,
  delay = 1000
): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

export const mockErrorFunction = (
  error: Error,
  delay = 1000
): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(error);
    }, delay);
  });
};

// テスト用のユーティリティ関数
export const generateTestId = (prefix: string): string => {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createMockEvent = (type: string, data?: any) => {
  return {
    type,
    data,
    timestamp: new Date().toISOString(),
  };
};

// テスト用のカスタムフック
export const useTestHook = () => {
  const [value, setValue] = React.useState(0);
  const increment = () => setValue((prev) => prev + 1);
  const decrement = () => setValue((prev) => prev - 1);
  return { value, increment, decrement };
};

// テスト用のカスタムコンポーネント
export const TestComponent: React.FC<{
  onMount?: () => void;
  onUnmount?: () => void;
}> = ({ onMount, onUnmount }) => {
  React.useEffect(() => {
    onMount?.();
    return () => onUnmount?.();
  }, [onMount, onUnmount]);

  return null;
};

// テスト用のカスタムレンダラー
export { customRender as render }; 