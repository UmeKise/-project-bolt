import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { StarRating } from './StarRating';
import { FeedbackService } from '../services/FeedbackService';

interface FeedbackFormProps {
  onClose: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ onClose }) => {
  const { theme } = useTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    '使いやすさ',
    '機能性',
    'デザイン',
    'パフォーマンス',
    'その他',
  ];

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('エラー', '評価を選択してください');
      return;
    }

    if (!category) {
      Alert.alert('エラー', 'カテゴリーを選択してください');
      return;
    }

    setIsSubmitting(true);
    try {
      await FeedbackService.submitFeedback({
        rating,
        comment,
        category,
        timestamp: Date.now(),
      });
      Alert.alert('成功', 'フィードバックを送信しました');
      onClose();
    } catch (error) {
      Alert.alert('エラー', 'フィードバックの送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View
        style={[
          styles.header,
          { borderBottomColor: theme.colors.border },
        ]}
      >
        <Text
          style={[
            styles.title,
            { color: theme.colors.text },
          ]}
        >
          フィードバック
        </Text>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
        >
          <Text
            style={[
              styles.closeButtonText,
              { color: theme.colors.primary },
            ]}
          >
            ✕
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text
            style={[
              styles.label,
              { color: theme.colors.text },
            ]}
          >
            評価
          </Text>
          <StarRating
            rating={rating}
            onRatingChange={setRating}
            size={32}
          />
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.label,
              { color: theme.colors.text },
            ]}
          >
            カテゴリー
          </Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor:
                      category === cat
                        ? theme.colors.primary
                        : theme.colors.card,
                  },
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    {
                      color:
                        category === cat
                          ? theme.colors.background
                          : theme.colors.text,
                    },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.label,
              { color: theme.colors.text },
            ]}
          >
            コメント
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            multiline
            numberOfLines={4}
            placeholder="フィードバックを入力してください"
            placeholderTextColor={theme.colors.textSecondary}
            value={comment}
            onChangeText={setComment}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: theme.colors.primary,
              opacity: isSubmitting ? 0.7 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text
            style={[
              styles.submitButtonText,
              { color: theme.colors.background },
            ]}
          >
            {isSubmitting ? '送信中...' : '送信'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryButtonText: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 