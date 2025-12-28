import { Text, Button, Section, Hr } from '@react-email/components';
import { BaseTemplate } from './base-template';

interface PaymentConfirmedEmailProps {
  customerName: string;
  planName: string;
  amount: number;
  paymentCode: string;
  subscriptionEndDate: string;
  dashboardUrl?: string;
}

export function PaymentConfirmedEmail({
  customerName,
  planName,
  amount,
  paymentCode,
  subscriptionEndDate,
  dashboardUrl,
}: PaymentConfirmedEmailProps) {
  const formattedAmount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);

  const formattedDate = new Intl.DateTimeFormat('vi-VN').format(
    new Date(subscriptionEndDate)
  );

  return (
    <BaseTemplate previewText="Thanh toán của bạn đã được xác nhận!">
      <Text style={styles.heading}>✅ Thanh toán thành công!</Text>

      <Text style={styles.text}>Xin chào {customerName},</Text>

      <Text style={styles.text}>
        Thanh toán của bạn đã được xác nhận. Cảm ơn bạn đã tin tưởng sử dụng dịch
        vụ của chúng tôi!
      </Text>

      {/* Payment Details */}
      <Section style={styles.card}>
        <Text style={styles.cardTitle}>Chi tiết thanh toán</Text>
        <Hr style={styles.divider} />

        <table style={styles.table}>
          <tbody>
            <tr>
              <td style={styles.labelCell}>Mã thanh toán:</td>
              <td style={styles.valueCell}>
                <strong>{paymentCode}</strong>
              </td>
            </tr>
            <tr>
              <td style={styles.labelCell}>Gói dịch vụ:</td>
              <td style={styles.valueCell}>{planName}</td>
            </tr>
            <tr>
              <td style={styles.labelCell}>Số tiền:</td>
              <td style={styles.valueCell}>
                <strong style={styles.amount}>{formattedAmount}</strong>
              </td>
            </tr>
            <tr>
              <td style={styles.labelCell}>Hết hạn:</td>
              <td style={styles.valueCell}>{formattedDate}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Text style={styles.text}>
        Bạn có thể xem thông tin chi tiết về gói dịch vụ trong tài khoản của mình.
      </Text>

      <Section style={styles.buttonContainer}>
        <Button
          style={styles.button}
          href={dashboardUrl || 'https://hoiquanplex.site/customer'}
        >
          Xem tài khoản của tôi
        </Button>
      </Section>

      <Text style={styles.text}>
        Cảm ơn bạn đã sử dụng dịch vụ!
        <br />
        <strong>Đội ngũ HoiQuanPlex</strong>
      </Text>
    </BaseTemplate>
  );
}

const styles = {
  heading: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 20px 0',
    color: '#16a34a',
  },
  text: {
    fontSize: '16px',
    lineHeight: '24px',
    margin: '16px 0',
    color: '#333333',
  },
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '20px',
    margin: '24px 0',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 12px 0',
    color: '#1e40af',
  },
  divider: {
    borderColor: '#e5e7eb',
    margin: '12px 0',
  },
  table: {
    width: '100%',
  },
  labelCell: {
    fontSize: '14px',
    color: '#6b7280',
    padding: '8px 0',
    width: '40%',
  },
  valueCell: {
    fontSize: '14px',
    color: '#111827',
    padding: '8px 0',
  },
  amount: {
    color: '#16a34a',
    fontSize: '18px',
  },
  buttonContainer: {
    textAlign: 'center' as const,
    margin: '32px 0',
  },
  button: {
    backgroundColor: '#1e40af',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    padding: '14px 28px',
    display: 'inline-block',
  },
};
