import { Reservation } from '../components/ReservationHistoryList';

interface EmailTemplate {
  subject: string;
  body: string;
}

export const generateCancellationEmail = (
  reservation: Reservation,
  cancellationFee: number,
  reason?: string
): EmailTemplate => {
  const formattedDate = reservation.date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const subject = `【予約キャンセル確認】${reservation.facilityName}`;

  const body = `
${reservation.facilityName}の予約キャンセルが完了しました。

【予約情報】
施設名：${reservation.facilityName}
日付：${formattedDate}
時間：${reservation.time}
人数：${reservation.numberOfPeople}名
予約金額：¥${reservation.amount.toLocaleString()}
キャンセル料金：¥${cancellationFee.toLocaleString()}

${reason ? `キャンセル理由：${reason}` : ''}

キャンセルポリシー：
${reservation.cancellationPolicy}

ご不明な点がございましたら、お気軽にお問い合わせください。

${reservation.facilityName}
電話：${reservation.phone}
メール：${reservation.email}
`;

  return { subject, body };
};

export const sendCancellationEmail = async (
  email: string,
  template: EmailTemplate
): Promise<void> => {
  try {
    // TODO: 実際のメール送信APIを実装
    console.log('Sending email to:', email);
    console.log('Subject:', template.subject);
    console.log('Body:', template.body);
    
    // メール送信のモック実装
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('メールの送信に失敗しました');
  }
}; 