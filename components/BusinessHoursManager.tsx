import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
} from 'react-native';
import { Clock, ChevronRight } from 'lucide-react-native';

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  isOpen: boolean;
  timeSlots: TimeSlot[];
}

interface BusinessHours {
  [key: string]: DaySchedule;
}

interface BusinessHoursManagerProps {
  initialHours: BusinessHours;
  onSave: (hours: BusinessHours) => void;
}

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const DAY_NAMES = {
  monday: '月曜日',
  tuesday: '火曜日',
  wednesday: '水曜日',
  thursday: '木曜日',
  friday: '金曜日',
  saturday: '土曜日',
  sunday: '日曜日',
};

export default function BusinessHoursManager({
  initialHours,
  onSave,
}: BusinessHoursManagerProps) {
  const [businessHours, setBusinessHours] = useState<BusinessHours>(initialHours);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const handleDayToggle = (day: string) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen,
      },
    }));
  };

  const handleTimeSlotChange = (day: string, index: number, field: 'start' | 'end', value: string) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot
        ),
      },
    }));
  };

  const addTimeSlot = (day: string) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: [...prev[day].timeSlots, { start: '09:00', end: '17:00' }],
      },
    }));
  };

  const removeTimeSlot = (day: string, index: number) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSave = () => {
    onSave(businessHours);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {DAYS.map((day) => (
          <View key={day} style={styles.dayContainer}>
            <View style={styles.dayHeader}>
              <View style={styles.dayInfo}>
                <Text style={styles.dayName}>{DAY_NAMES[day]}</Text>
                <Switch
                  value={businessHours[day].isOpen}
                  onValueChange={() => handleDayToggle(day)}
                />
              </View>
              {businessHours[day].isOpen && (
                <TouchableOpacity
                  style={styles.timeSlotsButton}
                  onPress={() => setSelectedDay(day)}
                >
                  <Clock size={20} color="#666" />
                  <Text style={styles.timeSlotsText}>
                    {businessHours[day].timeSlots.length}つの時間枠
                  </Text>
                  <ChevronRight size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>保存</Text>
      </TouchableOpacity>

      {selectedDay && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {DAY_NAMES[selectedDay]}の営業時間
            </Text>

            {businessHours[selectedDay].timeSlots.map((slot, index) => (
              <View key={index} style={styles.timeSlotRow}>
                <View style={styles.timeInputs}>
                  <TextInput
                    style={styles.timeInput}
                    value={slot.start}
                    onChangeText={(value) =>
                      handleTimeSlotChange(selectedDay, index, 'start', value)
                    }
                    placeholder="開始時間"
                  />
                  <Text style={styles.timeSeparator}>〜</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={slot.end}
                    onChangeText={(value) =>
                      handleTimeSlotChange(selectedDay, index, 'end', value)
                    }
                    placeholder="終了時間"
                  />
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeTimeSlot(selectedDay, index)}
                >
                  <Text style={styles.removeButtonText}>削除</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addTimeSlot(selectedDay)}
            >
              <Text style={styles.addButtonText}>時間枠を追加</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedDay(null)}
            >
              <Text style={styles.closeButtonText}>閉じる</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  dayContainer: {
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeSlotsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeSlotsText: {
    fontSize: 14,
    color: '#666',
  },
  saveButton: {
    margin: 20,
    padding: 16,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  timeSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  timeInputs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInput: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    fontSize: 14,
  },
  timeSeparator: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    color: '#F44336',
    fontSize: 14,
  },
  addButton: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  addButtonText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 12,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 