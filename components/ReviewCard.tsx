import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react-native';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface ReviewCardProps {
  review: {
    id: string;
    userId: string;
    userName: string;
    userImage?: string;
    rating: number;
    comment: string;
    images: string[];
    aspects: {
      cleanliness: number;
      service: number;
      value: number;
      atmosphere: number;
    };
    recommend: boolean;
    createdAt: Date;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
}

export default function ReviewCard({
  review,
  onEdit,
  onDelete,
  isEditable = false,
}: ReviewCardProps) {
  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            color={star <= rating ? '#FFC107' : '#E0E0E0'}
            fill={star <= rating ? '#FFC107' : 'none'}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {review.userImage ? (
            <Image source={{ uri: review.userImage }} style={styles.userImage} />
          ) : (
            <View style={styles.userImagePlaceholder}>
              <Text style={styles.userImagePlaceholderText}>
                {review.userName.charAt(0)}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.userName}>{review.userName}</Text>
            <Text style={styles.date}>
              {format(review.createdAt, 'yyyy年MM月dd日', { locale: ja })}
            </Text>
          </View>
        </View>
        {isEditable && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onEdit}
            >
              <Text style={styles.actionButtonText}>編集</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={onDelete}
            >
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                削除
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.ratingContainer}>
        <View style={styles.overallRating}>
          <Text style={styles.ratingLabel}>総合評価</Text>
          {renderStars(review.rating)}
        </View>
        <View style={styles.aspectsContainer}>
          <View style={styles.aspect}>
            <Text style={styles.aspectLabel}>清潔さ</Text>
            {renderStars(review.aspects.cleanliness)}
          </View>
          <View style={styles.aspect}>
            <Text style={styles.aspectLabel}>サービス</Text>
            {renderStars(review.aspects.service)}
          </View>
          <View style={styles.aspect}>
            <Text style={styles.aspectLabel}>コストパフォーマンス</Text>
            {renderStars(review.aspects.value)}
          </View>
          <View style={styles.aspect}>
            <Text style={styles.aspectLabel}>雰囲気</Text>
            {renderStars(review.aspects.atmosphere)}
          </View>
        </View>
      </View>

      <Text style={styles.comment}>{review.comment}</Text>

      {review.images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagesContainer}
        >
          {review.images.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.image} />
          ))}
        </ScrollView>
      )}

      <View style={styles.recommendContainer}>
        {review.recommend ? (
          <View style={styles.recommendBadge}>
            <ThumbsUp size={16} color="#4CAF50" />
            <Text style={styles.recommendText}>おすすめ</Text>
          </View>
        ) : (
          <View style={[styles.recommendBadge, styles.notRecommendBadge]}>
            <ThumbsDown size={16} color="#F44336" />
            <Text style={[styles.recommendText, styles.notRecommendText]}>
              おすすめしない
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userImagePlaceholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#F5F5F5',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  deleteButtonText: {
    color: '#F44336',
  },
  ratingContainer: {
    marginBottom: 16,
  },
  overallRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  aspectsContainer: {
    gap: 8,
  },
  aspect: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aspectLabel: {
    fontSize: 12,
    color: '#666',
    width: 100,
  },
  comment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 16,
  },
  imagesContainer: {
    marginBottom: 16,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 8,
  },
  recommendContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  recommendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    gap: 4,
  },
  notRecommendBadge: {
    backgroundColor: '#FFEBEE',
  },
  recommendText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  notRecommendText: {
    color: '#F44336',
  },
}); 