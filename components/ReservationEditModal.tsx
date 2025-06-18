import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { X, Calendar, Clock, Users } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface ReservationEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    date: Date;
    time: string;
    numberOfPeople: number;
  }) => void;
  initialData: {
    date: Date;
    time: string;
    numberOfPeople: number;
  };
  facilityName: string;
  minDate?: Date;
  maxDate?: Date;
  maxPeople?: number;
}

export const ReservationEditModal: React.FC<ReservationEditModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
  facilityName,
  minDate = new Date(),
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
  maxPeople = 10,
}) => {
  const [date, setDate] = useState(initialData.date);
  const [time, setTime] = useState(initialData.time);
  const [numberOfPeople, setNumberOfPeople] = useState(
    initialData.numberOfPeople.toString()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSubmit = () => {
    const people = parseInt(numberOfPeople, 10);
    if (isNaN(people) || people < 1 || people > maxPeople) {
      Alert.alert(
        'エラー',
        `人数は1人から${maxPeople}人までの間で指定してください。`
      );
      return;
    }

    onSubmit({
      date,
      time,
      numberOfPeople: people,
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(format(selectedTime, 'HH:mm'));
    }
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
            <Text style={styles.title}>予約の変更</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.facilityName}>{facilityName}</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>日付</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={20} color="#666" />
                <Text style={styles.inputText}>
                  {format(date, 'yyyy年MM月dd日 (EEEE)', { locale: ja })}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={minDate}
                  maximumDate={maxDate}
                />
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>時間</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowTimePicker(true)}
              >
                <Clock size={20} color="#666" />
                <Text style={styles.inputText}>{time}</Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={new Date(`2000-01-01T${time}`)}
                  mode="time"
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>人数</Text>
              <View style={styles.input}>
                <Users size={20} color="#666" />
                <TextInput
                  style={styles.numberInput}
                  value={numberOfPeople}
                  onChangeText={setNumberOfPeople}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={styles.unit}>名</Text>
              </View>
              <Text style={styles.hint}>
                ※1人から{maxPeople}人まで予約可能です
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={[styles.buttonText, styles.submitButtonText]}>
                変更する
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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
    maxHeight: '90%',
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
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  facilityName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  inputText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  numberInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  unit: {
    fontSize: 16,
    color: '#666',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  submitButtonText: {
    color: '#fff',
  },
}); 