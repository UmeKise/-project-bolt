import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { X } from 'lucide-react-native';

const categories = [
  '美術館',
  '公園',
  'カフェ',
  'レストラン',
  'ショッピング',
  'その他',
];

const features = [
  { id: 'barrierFree', label: 'バリアフリー' },
  { id: 'nursingRoom', label: '授乳室' },
  { id: 'kidsSpace', label: 'キッズスペース' },
  { id: 'strollerFriendly', label: 'ベビーカー対応' },
  { id: 'allergyFriendly', label: 'アレルギー対応' },
  { id: 'specializedStaff', label: '専門スタッフ' },
];

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    categories: string[];
    features: string[];
  }) => void;
  initialFilters?: {
    categories: string[];
    features: string[];
  };
}

export default function FilterModal({
  visible,
  onClose,
  onApply,
  initialFilters = { categories: [], features: [] },
}: FilterModalProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialFilters.categories
  );
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    initialFilters.features
  );

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(f => f !== featureId)
        : [...prev, featureId]
    );
  };

  const handleApply = () => {
    onApply({
      categories: selectedCategories,
      features: selectedFeatures,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedFeatures([]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>フィルター</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>カテゴリー</Text>
              <View style={styles.tagsContainer}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.tag,
                      selectedCategories.includes(category) && styles.selectedTag,
                    ]}
                    onPress={() => handleCategoryToggle(category)}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        selectedCategories.includes(category) && styles.selectedTagText,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>特徴</Text>
              <View style={styles.tagsContainer}>
                {features.map(feature => (
                  <TouchableOpacity
                    key={feature.id}
                    style={[
                      styles.tag,
                      selectedFeatures.includes(feature.id) && styles.selectedTag,
                    ]}
                    onPress={() => handleFeatureToggle(feature.id)}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        selectedFeatures.includes(feature.id) && styles.selectedTagText,
                      ]}
                    >
                      {feature.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>リセット</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>適用</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedTag: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  selectedTagText: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A90E2',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});