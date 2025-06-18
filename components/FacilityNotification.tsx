import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Clock, Calendar, Wrench, AlertTriangle } from 'lucide-react-native';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface FacilityNotificationProps {
  type: 'business_hours' | 'special_hours' | 'maintenance' | 'other';
  title: string;
  message: string;
  facilityName: string;
  facilityImage: string;
  startDate?: Date;
  endDate?: Date;
  onPress?: () => void;
}

export const FacilityNotification: React.FC<FacilityNotificationProps> = ({
  type,
  title,
  message,
  facilityName,
  facilityImage,
  startDate,
  endDate,
  onPress,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'business_hours':
        return <Clock size={24} color="#2196F3" />;
      case 'special_hours':
        return <Calendar size={24} color="#4CAF50" />;
      case 'maintenance':
        return <Wrench size={24} color="#F44336" />;
      default:
        return <AlertTriangle size={24} color="#FF9800" />;
    }
  };

  const getTypeText = () => {
    switch (type) {
      case 'business_hours':
        return '営業時間変更';
      case 'special_hours':
        return '特別営業';
      case 'maintenance':
        return 'メンテナンス';
      default:
        return 'お知らせ';
    }
  };

  const formatDate = (date: Date) => {
    return format(date, 'yyyy年MM月dd日', { locale: ja });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: facilityImage }} style={styles.facilityImage} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.typeContainer}>
            {getIcon()}
            <Text style={styles.typeText}>{getTypeText()}</Text>
          </View>
          {startDate && endDate && (
            <Text style={styles.dateText}>
              {formatDate(startDate)} 〜 {formatDate(endDate)}
            </Text>
          )}
        </View>

        <Text style={styles.facilityName}>{facilityName}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  facilityImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  facilityName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
}); 