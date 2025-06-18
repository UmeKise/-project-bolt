import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Calendar, Clock, Users } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface ReservationEditFormProps {
  initialDate: Date;
  initialTime: string;
  initialNumberOfPeople: number;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
  onNumberOfPeopleChange: (number: number) => void;
  minDate?: Date;
  maxDate?: Date;
  minPeople?: number;
  maxPeople?: number;
  availableTimeSlots?: string[];
}

export default function ReservationEditForm({
  initialDate,
  initialTime,
  initialNumberOfPeople,
  onDateChange,
  onTimeChange,
  onNumberOfPeopleChange,
  minDate = new Date(),
  maxDate = new Date(new Date().setMonth(new Date().getMonth() + 3)),
  minPeople = 1,
  maxPeople = 10,
  availableTimeSlots = [
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ],
}: ReservationEditFormProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      onDateChange(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const timeString = format(selectedTime, 'HH:mm');
      onTimeChange(timeString);
    }
  };

  const handleNumberOfPeopleChange = (value: number) => {
    if (value >= minPeople && value <= maxPeople) {
      onNumberOfPeopleChange(value);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Calendar size={20} color="#666" />
          <Text style={styles.sectionTitle}>日付</Text>
        </View>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.inputText}>
            {format(initialDate, 'yyyy年M月d日', { locale: ja })}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={initialDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={minDate}
            maximumDate={maxDate}
          />
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Clock size={20} color="#666" />
          <Text style={styles.sectionTitle}>時間</Text>
        </View>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.inputText}>{initialTime}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={new Date(`2000-01-01T${initialTime}`)}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Users size={20} color="#666" />
          <Text style={styles.sectionTitle}>人数</Text>
        </View>
        <View style={styles.numberInput}>
          <TouchableOpacity
            style={styles.numberButton}
            onPress={() => handleNumberOfPeopleChange(initialNumberOfPeople - 1)}
            disabled={initialNumberOfPeople <= minPeople}
          >
            <Text
              style={[
                styles.numberButtonText,
                initialNumberOfPeople <= minPeople && styles.disabledText,
              ]}
            >
              -
            </Text>
          </TouchableOpacity>
          <Text style={styles.numberText}>{initialNumberOfPeople}名</Text>
          <TouchableOpacity
            style={styles.numberButton}
            onPress={() => handleNumberOfPeopleChange(initialNumberOfPeople + 1)}
            disabled={initialNumberOfPeople >= maxPeople}
          >
            <Text
              style={[
                styles.numberButtonText,
                initialNumberOfPeople >= maxPeople && styles.disabledText,
              ]}
            >
              +
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  numberInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
  },
  numberButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  numberButtonText: {
    fontSize: 20,
    color: '#2196F3',
  },
  disabledText: {
    color: '#ccc',
  },
  numberText: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
  },
}); 