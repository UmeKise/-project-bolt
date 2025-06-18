import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Star, Camera, X, ThumbsUp, ThumbsDown } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

interface ReviewEditFormProps {
  facilityName: string;
  initialReview: ReviewData;
  onSubmit: (review: ReviewData) => Promise<void>;
  onCancel: () => void;
  onDelete: () => Promise<void>;
}

interface ReviewData {
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
}

export default function ReviewEditForm({
  facilityName,
  initialReview,
  onSubmit,
  onCancel,
  onDelete,
}: ReviewEditFormProps) {
  const [rating, setRating] = useState(initialReview.rating);
  const [comment, setComment] = useState(initialReview.comment);
  const [images, setImages] = useState<string[]>(initialReview.images);
  const [aspects, setAspects] = useState(initialReview.aspects);
  const [recommend, setRecommend] = useState(initialReview.recommend);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('エラー', 'カメラロールへのアクセス権限が必要です。');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('エラー', '評価を選択してください。');
      return;
    }

    if (!comment) {
      Alert.alert('エラー', 'コメントを入力してください。');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        rating,
        comment,
        images,
        aspects,
        recommend,
      });
    } catch (error) {
      Alert.alert('エラー', 'レビューの更新に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      '確認',
      'このレビューを削除してもよろしいですか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await onDelete();
            } catch (error) {
              Alert.alert('エラー', 'レビューの削除に失敗しました。');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderStars = (value: number, onChange: (value: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onChange(star)}
            style={styles.starButton}
          >
            <Star
              size={24}
              color={star <= value ? '#FFC107' : '#E0E0E0'}
              fill={star <= value ? '#FFC107' : 'none'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{facilityName}のレビューを編集</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>総合評価</Text>
        {renderStars(rating, setRating)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>詳細評価</Text>
        <View style={styles.aspectsContainer}>
          <View style={styles.aspect}>
            <Text style={styles.aspectLabel}>清潔さ</Text>
            {renderStars(aspects.cleanliness, (value) =>
              setAspects({ ...aspects, cleanliness: value })
            )}
          </View>
          <View style={styles.aspect}>
            <Text style={styles.aspectLabel}>サービス</Text>
            {renderStars(aspects.service, (value) =>
              setAspects({ ...aspects, service: value })
            )}
          </View>
          <View style={styles.aspect}>
            <Text style={styles.aspectLabel}>コストパフォーマンス</Text>
            {renderStars(aspects.value, (value) =>
              setAspects({ ...aspects, value: value })
            )}
          </View>
          <View style={styles.aspect}>
            <Text style={styles.aspectLabel}>雰囲気</Text>
            {renderStars(aspects.atmosphere, (value) =>
              setAspects({ ...aspects, atmosphere: value })
            )}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>コメント</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="施設の感想を入力してください"
          multiline
          numberOfLines={4}
          value={comment}
          onChangeText={setComment}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>写真</Text>
        <View style={styles.imagesContainer}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage(index)}
              >
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 5 && (
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={pickImage}
            >
              <Camera size={24} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>おすすめしますか？</Text>
        <View style={styles.recommendContainer}>
          <TouchableOpacity
            style={[
              styles.recommendButton,
              recommend === true && styles.recommendButtonActive,
            ]}
            onPress={() => setRecommend(true)}
          >
            <ThumbsUp
              size={24}
              color={recommend === true ? '#fff' : '#666'}
            />
            <Text
              style={[
                styles.recommendButtonText,
                recommend === true && styles.recommendButtonTextActive,
              ]}
            >
              おすすめする
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.recommendButton,
              recommend === false && styles.recommendButtonActive,
            ]}
            onPress={() => setRecommend(false)}
          >
            <ThumbsDown
              size={24}
              color={recommend === false ? '#fff' : '#666'}
            />
            <Text
              style={[
                styles.recommendButtonText,
                recommend === false && styles.recommendButtonTextActive,
              ]}
            >
              おすすめしない
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={isLoading}
        >
          <Text style={styles.deleteButtonText}>削除</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>キャンセル</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? '更新中...' : '更新'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
    color: '#333',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: '#333',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starButton: {
    padding: 4,
  },
  aspectsContainer: {
    gap: 16,
  },
  aspect: {
    marginBottom: 12,
  },
  aspectLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#F44336',
    borderRadius: 12,
    padding: 4,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  recommendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    gap: 8,
  },
  recommendButtonActive: {
    backgroundColor: '#4CAF50',
  },
  recommendButtonText: {
    fontSize: 16,
    color: '#666',
  },
  recommendButtonTextActive: {
    color: '#fff',
  },
  buttonsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  deleteButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F44336',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  submitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
}); 