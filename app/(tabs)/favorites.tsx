import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Heart, Share2, MapPin, Star } from 'lucide-react-native';
import { FacilityCard } from '@/components/FacilityCard';

export default function FavoritesScreen() {
  const [favorites] = useState([
    {
      id: 1,
      name: '東京都現代美術館',
      category: '美術館',
      address: '東京都江東区三好4-1-1',
      rating: 4.5,
      distance: '1.2km',
      features: ['barrierFree', 'nursingRoom', 'strollerFriendly'],
      image: 'https://images.pexels.com/photos/1001965/pexels-photo-1001965.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'ベビーカーでの入館可能。授乳室完備で小さなお子様連れでも安心です。',
    },
    {
      id: 2,
      name: 'みどりの公園',
      category: '公園',
      address: '東京都品川区中延2-9-1',
      rating: 4.8,
      distance: '0.8km',
      features: ['barrierFree', 'kidsSpace', 'specializedStaff'],
      image: 'https://images.pexels.com/photos/1612361/pexels-photo-1612361.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: '療育士が常駐しており、障害を持つお子様も安心して遊べます。',
    },
  ]);

  const recentlyVisited = [
    {
      id: 3,
      name: 'やさしいカフェ',
      visitDate: '2024年1月15日',
      rating: 5,
      comment: 'スタッフの方がとても親切で、子どもも楽しく過ごせました。',
    },
    {
      id: 4,
      name: '子ども科学館',
      visitDate: '2024年1月10日',
      rating: 4,
      comment: '車椅子での移動もスムーズで助かりました。',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>お気に入り</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Share2 size={20} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Heart size={20} color="#FF3B30" fill="#FF3B30" />
            <Text style={styles.sectionTitle}>保存済みの施設</Text>
          </View>
          
          {favorites.length > 0 ? (
            favorites.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Heart size={48} color="#ccc" />
              <Text style={styles.emptyTitle}>まだお気に入りがありません</Text>
              <Text style={styles.emptyDescription}>
                気に入った施設をハートマークで保存しましょう
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#4A90E2" />
            <Text style={styles.sectionTitle}>最近訪問した施設</Text>
          </View>
          
          {recentlyVisited.map((visit) => (
            <View key={visit.id} style={styles.visitCard}>
              <View style={styles.visitHeader}>
                <Text style={styles.visitName}>{visit.name}</Text>
                <Text style={styles.visitDate}>{visit.visitDate}</Text>
              </View>
              
              <View style={styles.visitRating}>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      color={star <= visit.rating ? '#FFD700' : '#e0e0e0'}
                      fill={star <= visit.rating ? '#FFD700' : '#e0e0e0'}
                    />
                  ))}
                </View>
              </View>
              
              <Text style={styles.visitComment}>{visit.comment}</Text>
              
              <TouchableOpacity style={styles.reviewButton}>
                <Text style={styles.reviewButtonText}>詳しいレビューを書く</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>共有機能</Text>
          <Text style={styles.sectionDescription}>
            お気に入りの施設リストを家族や友人と共有できます
          </Text>
          
          <TouchableOpacity style={styles.shareListButton}>
            <Share2 size={20} color="#4A90E2" />
            <Text style={styles.shareListText}>リストを共有する</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  shareButton: {
    padding: 8,
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
    paddingTop: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    marginBottom: 15,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  visitCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  visitName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  visitDate: {
    fontSize: 12,
    color: '#666',
  },
  visitRating: {
    marginBottom: 10,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  visitComment: {
    fontSize: 14,
    color: '#555',
    lineHeight: 18,
    marginBottom: 12,
  },
  reviewButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
  },
  reviewButtonText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
  },
  shareListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4A90E2',
    gap: 8,
  },
  shareListText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
});