import { Platform } from 'react-native';
import { CancellationRecord } from '../types/cancellation';

// メッセージの種類
export type MessageType = 'text' | 'image' | 'file' | 'system';

// メッセージの送信者
export type MessageSender = 'user' | 'support' | 'system';

// メッセージのインターフェース
export interface ChatMessage {
  id: string;
  type: MessageType;
  sender: MessageSender;
  content: string;
  timestamp: Date;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    imageUrl?: string;
  };
}

// チャットセッションのインターフェース
export interface ChatSession {
  id: string;
  userId: string;
  facilityId?: string;
  cancellationId?: string;
  status: 'active' | 'resolved' | 'closed';
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// チャットセッションを保存
const chatSessions: ChatSession[] = [];

// 新しいチャットセッションを作成
export const createChatSession = (
  userId: string,
  facilityId?: string,
  cancellationId?: string
): ChatSession => {
  const session: ChatSession = {
    id: `chat_${Date.now()}`,
    userId,
    facilityId,
    cancellationId,
    status: 'active',
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  chatSessions.push(session);
  return session;
};

// チャットセッションを取得
export const getChatSession = (sessionId: string): ChatSession | undefined => {
  return chatSessions.find((session) => session.id === sessionId);
};

// ユーザーのチャットセッション一覧を取得
export const getUserChatSessions = (userId: string): ChatSession[] => {
  return chatSessions.filter((session) => session.userId === userId);
};

// メッセージを送信
export const sendMessage = (
  sessionId: string,
  message: Omit<ChatMessage, 'id' | 'timestamp'>
): ChatMessage | null => {
  const session = getChatSession(sessionId);
  if (!session) return null;

  const newMessage: ChatMessage = {
    ...message,
    id: `msg_${Date.now()}`,
    timestamp: new Date(),
  };

  session.messages.push(newMessage);
  session.updatedAt = new Date();

  return newMessage;
};

// システムメッセージを送信
export const sendSystemMessage = (
  sessionId: string,
  content: string
): ChatMessage | null => {
  return sendMessage(sessionId, {
    type: 'system',
    sender: 'system',
    content,
  });
};

// キャンセル関連のメッセージを送信
export const sendCancellationMessage = (
  sessionId: string,
  cancellation: CancellationRecord
): ChatMessage | null => {
  const content = `
キャンセル詳細:
施設: ${cancellation.facilityName}
日時: ${cancellation.cancellationDate}
金額: ${cancellation.amount}円
キャンセル料: ${cancellation.cancellationFee}円
理由: ${cancellation.reason || '未指定'}
  `.trim();

  return sendSystemMessage(sessionId, content);
};

// チャットセッションを解決済みに設定
export const resolveChatSession = (sessionId: string): boolean => {
  const session = getChatSession(sessionId);
  if (!session) return false;

  session.status = 'resolved';
  session.updatedAt = new Date();
  return true;
};

// チャットセッションを閉じる
export const closeChatSession = (sessionId: string): boolean => {
  const session = getChatSession(sessionId);
  if (!session) return false;

  session.status = 'closed';
  session.updatedAt = new Date();
  return true;
};

// チャットセッションを検索
export const searchChatSessions = (
  query: string,
  userId?: string
): ChatSession[] => {
  return chatSessions.filter((session) => {
    if (userId && session.userId !== userId) return false;

    return session.messages.some((message) =>
      message.content.toLowerCase().includes(query.toLowerCase())
    );
  });
};

// チャットセッションの統計を取得
export const getChatStats = (): {
  totalSessions: number;
  activeSessions: number;
  resolvedSessions: number;
  averageResponseTime: number;
} => {
  const stats = {
    totalSessions: chatSessions.length,
    activeSessions: 0,
    resolvedSessions: 0,
    averageResponseTime: 0,
  };

  let totalResponseTime = 0;
  let responseCount = 0;

  chatSessions.forEach((session) => {
    if (session.status === 'active') stats.activeSessions++;
    if (session.status === 'resolved') stats.resolvedSessions++;

    // レスポンス時間を計算
    for (let i = 1; i < session.messages.length; i++) {
      const prevMessage = session.messages[i - 1];
      const currentMessage = session.messages[i];

      if (
        prevMessage.sender === 'user' &&
        currentMessage.sender === 'support'
      ) {
        const responseTime =
          currentMessage.timestamp.getTime() -
          prevMessage.timestamp.getTime();
        totalResponseTime += responseTime;
        responseCount++;
      }
    }
  });

  stats.averageResponseTime =
    responseCount > 0 ? totalResponseTime / responseCount : 0;

  return stats;
};

// チャットセッションをエクスポート
export const exportChatSession = (sessionId: string): string => {
  const session = getChatSession(sessionId);
  if (!session) return '';

  const exportData = {
    sessionId: session.id,
    userId: session.userId,
    facilityId: session.facilityId,
    cancellationId: session.cancellationId,
    status: session.status,
    messages: session.messages,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };

  return JSON.stringify(exportData, null, 2);
}; 