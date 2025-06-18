import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Star, Search, Filter } from 'lucide-react-native';
import { feedbackService, Feedback } from '../services/FeedbackService';

interface FeedbackListProps {
  userId?: string;
  onFeedbackPress?: (feedback: Feedback) => void;
}

export const FeedbackList: React.FC<FeedbackListProps> = ({
  userId,
  onFeedbackPress,
}) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<{
    total: number;
    byType: Record<Feedback['type'], number>;
    byRating: Record<number, number>;
    byStatus: Record<Feedback['status'], number>;
    averageRating: number;
  } | null>(null);

  useEffect(() => {
    loadFeedbacks();
    loadStats();
  }, [userId]);

  const loadFeedbacks = async () => {
    try {
      const data = userId
        ? await feedbackService.getUserFeedbacks(userId)
        : await feedbackService.getAllFeedbacks();
      setFeedbacks(data);
    } catch (error) {
      console.error('フィードバックの読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await feedbackService.getFeedbackStats();
      setStats(data);
    } catch (error) {
      console.error('統計情報の読み込みに失敗しました:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeedbacks();
    loadStats();
  };

  const renderFeedbackItem = ({ item }: { item: Feedback }) => (
    <TouchableOpacity
      style={styles.feedbackItem}
      onPress={() => onFeedbackPress?.(item)}
    >
      <View style={styles.feedbackHeader}>
        <Text style={styles.userName}>{item.userName}</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              size={16}
              color={star <= item.rating ? '#FFD700' : '#E0E0E0'}
              fill={star <= item.rating ? '#FFD700' : 'none'}
            />
          ))}
        </View>
      </View>

      <Text style={styles.feedbackType}>
        {getTypeLabel(item.type)} • {getStatusLabel(item.status)}
      </Text>

      <Text style={styles.feedbackComment} numberOfLines={2}>
        {item.comment}
      </Text>

      <Text style={styles.feedbackTime}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>

      {item.response && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseLabel}>返信:</Text>
          <Text style={styles.responseText}>{item.response}</Text>
          <Text style={styles.responseTime}>
            {new Date(item.responseTimestamp!).toLocaleString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderStats = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statsItem}>
            <Text style={styles.statsLabel}>総数</Text>
            <Text style={styles.statsValue}>{stats.total}</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsLabel}>平均評価</Text>
            <Text style={styles.statsValue}>
              {stats.averageRating.toFixed(1)}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statsItem}>
            <Text style={styles.statsLabel}>未対応</Text>
            <Text style={styles.statsValue}>{stats.byStatus.pending}</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsLabel}>対応中</Text>
            <Text style={styles.statsValue}>{stats.byStatus.reviewed}</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsLabel}>解決済</Text>
            <Text style={styles.statsValue}>{stats.byStatus.resolved}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderStats()}

      <View style={styles.header}>
        <TouchableOpacity style={styles.searchButton}>
          <Search size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={feedbacks}
        renderItem={renderFeedbackItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
};

const getTypeLabel = (type: Feedback['type']): string => {
  const labels: Record<Feedback['type'], string> = {
    cancellation: 'キャンセル',
    payment: '支払い',
    policy: 'ポリシー',
    general: 'その他',
  };
  return labels[type];
};

const getStatusLabel = (status: Feedback['status']): string => {
  const labels: Record<Feedback['status'], string> = {
    pending: '未対応',
    reviewed: '対応中',
    resolved: '解決済',
  };
  return labels[status];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  statsItem: {
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchButton: {
    padding: 8,
    marginRight: 8,
  },
  filterButton: {
    padding: 8,
  },
  list: {
    padding: 16,
  },
  feedbackItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  feedbackType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  feedbackComment: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  feedbackTime: {
    fontSize: 12,
    color: '#999',
  },
  responseContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  responseTime: {
    fontSize: 12,
    color: '#999',
  },
}); 