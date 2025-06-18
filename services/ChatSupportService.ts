import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { CancellationRecord } from '../types/cancellation';

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  type: 'user' | 'support';
  status: 'sent' | 'delivered' | 'read';
  attachments?: {
    type: 'image' | 'document';
    url: string;
    name: string;
  }[];
}

export interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  status: 'active' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  messages: ChatMessage[];
  category: 'cancellation' | 'payment' | 'policy' | 'general';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
}

interface SupportAgent {
  id: string;
  name: string;
  email: string;
  status: 'online' | 'busy' | 'offline';
  specialties: string[];
}

class ChatSupportService {
  private static instance: ChatSupportService;
  private sessions: Map<string, ChatSession> = new Map();
  private supportAgents: SupportAgent[] = [];
  private messageHandlers: ((message: ChatMessage) => void)[] = [];

  private constructor() {
    this.initializeAgents();
    this.loadSessions();
  }

  static getInstance(): ChatSupportService {
    if (!ChatSupportService.instance) {
      ChatSupportService.instance = new ChatSupportService();
    }
    return ChatSupportService.instance;
  }

  private async initializeAgents(): Promise<void> {
    // 実際の環境では、データベースからエージェント情報を取得
    this.supportAgents = [
      {
        id: '1',
        name: '山田太郎',
        email: 'yamada@example.com',
        status: 'online',
        specialties: ['キャンセルポリシー', '支払い関連'],
      },
      {
        id: '2',
        name: '鈴木花子',
        email: 'suzuki@example.com',
        status: 'online',
        specialties: ['予約管理', 'システム操作'],
      },
    ];
  }

  // セッションの読み込み
  private async loadSessions(): Promise<void> {
    try {
      const storedSessions = await SecureStore.getItemAsync('chat_sessions');
      if (storedSessions) {
        this.sessions = new Map(JSON.parse(storedSessions));
      }
    } catch (error) {
      console.error('チャットセッションの読み込みに失敗しました:', error);
    }
  }

  // セッションの保存
  private async saveSessions(): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        'chat_sessions',
        JSON.stringify(Array.from(this.sessions.entries()))
      );
    } catch (error) {
      console.error('チャットセッションの保存に失敗しました:', error);
    }
  }

  // 新しいセッションの作成
  async createSession(
    userId: string,
    userName: string,
    category: ChatSession['category'],
    priority: ChatSession['priority'] = 'medium'
  ): Promise<ChatSession> {
    const session: ChatSession = {
      id: `session_${Date.now()}`,
      userId,
      userName,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      messages: [],
      category,
      priority,
    };

    this.sessions.set(session.id, session);
    await this.saveSessions();
    return session;
  }

  // メッセージの送信
  async sendMessage(
    sessionId: string,
    userId: string,
    userName: string,
    content: string,
    attachments?: ChatMessage['attachments']
  ): Promise<ChatMessage> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('セッションが見つかりません');
    }

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId,
      userName,
      content,
      timestamp: new Date().toISOString(),
      type: 'user',
      status: 'sent',
      attachments,
    };

    session.messages.push(message);
    session.lastMessageAt = message.timestamp;
    session.updatedAt = message.timestamp;

    this.sessions.set(sessionId, session);
    await this.saveSessions();

    // メッセージハンドラーを呼び出し
    this.messageHandlers.forEach(handler => handler(message));

    return message;
  }

  // サポートからの返信
  async sendSupportReply(
    sessionId: string,
    content: string,
    attachments?: ChatMessage['attachments']
  ): Promise<ChatMessage> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('セッションが見つかりません');
    }

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: 'support',
      userName: 'サポート担当',
      content,
      timestamp: new Date().toISOString(),
      type: 'support',
      status: 'sent',
      attachments,
    };

    session.messages.push(message);
    session.lastMessageAt = message.timestamp;
    session.updatedAt = message.timestamp;

    this.sessions.set(sessionId, session);
    await this.saveSessions();

    // メッセージハンドラーを呼び出し
    this.messageHandlers.forEach(handler => handler(message));

    return message;
  }

  // セッションの取得
  async getSession(sessionId: string): Promise<ChatSession | undefined> {
    return this.sessions.get(sessionId);
  }

  // ユーザーのセッション一覧を取得
  async getUserSessions(userId: string): Promise<ChatSession[]> {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }

  // アクティブなセッション一覧を取得
  async getActiveSessions(): Promise<ChatSession[]> {
    return Array.from(this.sessions.values())
      .filter(session => session.status === 'active')
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }

  // セッションのステータスを更新
  async updateSessionStatus(
    sessionId: string,
    status: ChatSession['status']
  ): Promise<ChatSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('セッションが見つかりません');
    }

    session.status = status;
    session.updatedAt = new Date().toISOString();

    this.sessions.set(sessionId, session);
    await this.saveSessions();

    return session;
  }

  // メッセージのステータスを更新
  async updateMessageStatus(
    sessionId: string,
    messageId: string,
    status: ChatMessage['status']
  ): Promise<ChatMessage> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('セッションが見つかりません');
    }

    const message = session.messages.find(msg => msg.id === messageId);
    if (!message) {
      throw new Error('メッセージが見つかりません');
    }

    message.status = status;
    this.sessions.set(sessionId, session);
    await this.saveSessions();

    return message;
  }

  // メッセージハンドラーの登録
  onMessage(handler: (message: ChatMessage) => void): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  // キャンセル記録に関連するセッションの作成
  async createCancellationSession(
    record: CancellationRecord,
    priority: ChatSession['priority'] = 'medium'
  ): Promise<ChatSession> {
    return this.createSession(
      record.userId,
      record.userName,
      'cancellation',
      priority
    );
  }

  // セッションの検索
  async searchSessions(query: string): Promise<ChatSession[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.sessions.values()).filter(session => {
      const messageContent = session.messages
        .map(msg => msg.content.toLowerCase())
        .join(' ');
      return (
        session.userName.toLowerCase().includes(searchTerm) ||
        messageContent.includes(searchTerm)
      );
    });
  }

  // セッションの統計情報を取得
  async getSessionStats(): Promise<{
    total: number;
    active: number;
    resolved: number;
    closed: number;
    byCategory: Record<ChatSession['category'], number>;
    byPriority: Record<ChatSession['priority'], number>;
  }> {
    const sessions = Array.from(this.sessions.values());
    const stats = {
      total: sessions.length,
      active: sessions.filter(s => s.status === 'active').length,
      resolved: sessions.filter(s => s.status === 'resolved').length,
      closed: sessions.filter(s => s.status === 'closed').length,
      byCategory: {
        cancellation: 0,
        payment: 0,
        policy: 0,
        general: 0,
      },
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
      },
    };

    sessions.forEach(session => {
      stats.byCategory[session.category]++;
      stats.byPriority[session.priority]++;
    });

    return stats;
  }
}

export const chatSupportService = new ChatSupportService(); 