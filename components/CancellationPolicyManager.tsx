import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Plus, Trash2, Save } from 'lucide-react-native';
import { CancellationPolicy, CancellationRule } from '../utils/cancellationPolicy';

interface CancellationPolicyManagerProps {
  policy: CancellationPolicy;
  onSave: (policy: CancellationPolicy) => void;
}

export const CancellationPolicyManager: React.FC<CancellationPolicyManagerProps> = ({
  policy,
  onSave,
}) => {
  const [editedPolicy, setEditedPolicy] = useState<CancellationPolicy>(policy);
  const [isEditing, setIsEditing] = useState(false);

  const handleAddRule = () => {
    const newRule: CancellationRule = {
      hoursBeforeReservation: 0,
      feePercentage: 0,
      description: '',
    };
    setEditedPolicy({
      ...editedPolicy,
      rules: [...editedPolicy.rules, newRule],
    });
  };

  const handleRemoveRule = (index: number) => {
    Alert.alert(
      'ルールの削除',
      'このルールを削除してもよろしいですか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            const newRules = [...editedPolicy.rules];
            newRules.splice(index, 1);
            setEditedPolicy({
              ...editedPolicy,
              rules: newRules,
            });
          },
        },
      ]
    );
  };

  const handleUpdateRule = (
    index: number,
    field: keyof CancellationRule,
    value: string | number
  ) => {
    const newRules = [...editedPolicy.rules];
    newRules[index] = {
      ...newRules[index],
      [field]: value,
    };
    setEditedPolicy({
      ...editedPolicy,
      rules: newRules,
    });
  };

  const handleSave = () => {
    // バリデーション
    if (!editedPolicy.name.trim()) {
      Alert.alert('エラー', 'ポリシー名を入力してください');
      return;
    }

    if (!editedPolicy.description.trim()) {
      Alert.alert('エラー', 'ポリシーの説明を入力してください');
      return;
    }

    if (editedPolicy.rules.length === 0) {
      Alert.alert('エラー', '少なくとも1つのルールが必要です');
      return;
    }

    // ルールの順序を時間の降順にソート
    const sortedRules = [...editedPolicy.rules].sort(
      (a, b) => b.hoursBeforeReservation - a.hoursBeforeReservation
    );

    onSave({
      ...editedPolicy,
      rules: sortedRules,
    });
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>キャンセルポリシー管理</Text>
        {!isEditing ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>編集</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Save size={20} color="#fff" />
            <Text style={styles.saveButtonText}>保存</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本情報</Text>
          <TextInput
            style={styles.input}
            placeholder="ポリシー名"
            value={editedPolicy.name}
            onChangeText={(text) =>
              setEditedPolicy({ ...editedPolicy, name: text })
            }
            editable={isEditing}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="ポリシーの説明"
            value={editedPolicy.description}
            onChangeText={(text) =>
              setEditedPolicy({ ...editedPolicy, description: text })
            }
            multiline
            numberOfLines={4}
            editable={isEditing}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>キャンセルルール</Text>
            {isEditing && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddRule}
              >
                <Plus size={20} color="#fff" />
                <Text style={styles.addButtonText}>ルールを追加</Text>
              </TouchableOpacity>
            )}
          </View>

          {editedPolicy.rules.map((rule, index) => (
            <View key={index} style={styles.ruleContainer}>
              <View style={styles.ruleHeader}>
                <Text style={styles.ruleTitle}>ルール {index + 1}</Text>
                {isEditing && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoveRule(index)}
                  >
                    <Trash2 size={20} color="#F44336" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.ruleInputs}>
                <View style={styles.ruleInput}>
                  <Text style={styles.ruleLabel}>予約前の時間</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={rule.hoursBeforeReservation.toString()}
                    onChangeText={(text) =>
                      handleUpdateRule(
                        index,
                        'hoursBeforeReservation',
                        parseInt(text, 10) || 0
                      )
                    }
                    editable={isEditing}
                  />
                </View>

                <View style={styles.ruleInput}>
                  <Text style={styles.ruleLabel}>料金率 (%)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={rule.feePercentage.toString()}
                    onChangeText={(text) =>
                      handleUpdateRule(
                        index,
                        'feePercentage',
                        parseInt(text, 10) || 0
                      )
                    }
                    editable={isEditing}
                  />
                </View>
              </View>

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="ルールの説明"
                value={rule.description}
                onChangeText={(text) =>
                  handleUpdateRule(index, 'description', text)
                }
                multiline
                numberOfLines={2}
                editable={isEditing}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  ruleContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ruleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 4,
  },
  ruleInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ruleInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  ruleLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
}); 