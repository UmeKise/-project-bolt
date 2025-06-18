import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CreditCard, Calendar, Lock } from 'lucide-react-native';

interface PaymentProcessorProps {
  amount: number;
  onPaymentComplete: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
}

interface CardDetails {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
}

export default function PaymentProcessor({
  amount,
  onPaymentComplete,
  onPaymentError,
}: PaymentProcessorProps) {
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCardNumber = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiry = (expiry: string) => {
    const cleaned = expiry.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const validateCardDetails = () => {
    if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length !== 16) {
      Alert.alert('エラー', '有効なカード番号を入力してください');
      return false;
    }
    if (!cardDetails.expiry || cardDetails.expiry.length !== 5) {
      Alert.alert('エラー', '有効な有効期限を入力してください');
      return false;
    }
    if (!cardDetails.cvc || cardDetails.cvc.length !== 3) {
      Alert.alert('エラー', '有効なCVCを入力してください');
      return false;
    }
    if (!cardDetails.name) {
      Alert.alert('エラー', 'カード名義人を入力してください');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateCardDetails()) return;

    setIsProcessing(true);
    try {
      // ここで実際の支払い処理APIを呼び出す
      // 例: const response = await processPayment(cardDetails, amount);
      const paymentId = 'PAY-' + Math.random().toString(36).substr(2, 9);
      onPaymentComplete(paymentId);
    } catch (error) {
      onPaymentError(error instanceof Error ? error.message : '支払い処理中にエラーが発生しました');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>支払い金額</Text>
        <Text style={styles.amount}>¥{amount.toLocaleString()}</Text>
      </View>

      <View style={styles.cardDetailsContainer}>
        <View style={styles.inputGroup}>
          <View style={styles.inputIcon}>
            <CreditCard size={20} color="#666" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="カード番号"
            keyboardType="numeric"
            maxLength={19}
            value={cardDetails.number}
            onChangeText={(text) =>
              setCardDetails({ ...cardDetails, number: formatCardNumber(text) })
            }
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.expiryInput]}>
            <View style={styles.inputIcon}>
              <Calendar size={20} color="#666" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="MM/YY"
              keyboardType="numeric"
              maxLength={5}
              value={cardDetails.expiry}
              onChangeText={(text) =>
                setCardDetails({ ...cardDetails, expiry: formatExpiry(text) })
              }
            />
          </View>

          <View style={[styles.inputGroup, styles.cvcInput]}>
            <View style={styles.inputIcon}>
              <Lock size={20} color="#666" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="CVC"
              keyboardType="numeric"
              maxLength={3}
              value={cardDetails.cvc}
              onChangeText={(text) =>
                setCardDetails({ ...cardDetails, cvc: text })
              }
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="カード名義人"
            value={cardDetails.name}
            onChangeText={(text) =>
              setCardDetails({ ...cardDetails, name: text })
            }
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
        onPress={handlePayment}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payButtonText}>支払う</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.securityNote}>
        すべての支払い情報は安全に暗号化されます
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  cardDetailsContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
  },
  inputIcon: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  expiryInput: {
    flex: 2,
  },
  cvcInput: {
    flex: 1,
  },
  payButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  securityNote: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
}); 