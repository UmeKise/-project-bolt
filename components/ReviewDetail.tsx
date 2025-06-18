import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Star, ThumbsUp, ThumbsDown, X } from 'lucide-react-native';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface ReviewDetailProps {
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
  onClose: () => void;
  onImagePress?: (index: number) => void;
}

export default function ReviewDetail({
  review,
  onClose,
  onImagePress,
}: ReviewDetailProps) {
  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={24}
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
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
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
          <View style={styles.imagesContainer}>
            {review.images.map((uri, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onImagePress?.(index)}
                style={styles.imageWrapper}
              >
                <Image source={{ uri }} style={styles.image} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.recommendContainer}>
          {review.recommend ? (
            <View style={styles.recommendBadge}>
              <ThumbsUp size={20} color="#4CAF50" />
              <Text style={styles.recommendText}>おすすめ</Text>
            </View>
          ) : (
            <View style={[styles.recommendBadge, styles.notRecommendBadge]}>
              <ThumbsDown size={20} color="#F44336" />
              <Text style={[styles.recommendText, styles.notRecommendText]}>
                おすすめしない
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');
const imageSize = (width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  userImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  userImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userImagePlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
  },
  userName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  ratingContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  overallRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 12,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  aspectsContainer: {
    gap: 12,
  },
  aspect: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aspectLabel: {
    fontSize: 14,
    color: '#666',
    width: 120,
  },
  comment: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  imageWrapper: {
    width: imageSize,
    height: imageSize,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  recommendContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  recommendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    gap: 8,
  },
  notRecommendBadge: {
    backgroundColor: '#FFEBEE',
  },
  recommendText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  notRecommendText: {
    color: '#F44336',
  },
}); 