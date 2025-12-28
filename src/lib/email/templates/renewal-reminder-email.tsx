import {
  Text,
  Button,
  Section,
} from '@react-email/components';
import { BaseTemplate } from './base-template';
import { formatCurrency, formatDate } from '@/lib/utils/format';

interface RenewalReminderEmailProps {
  customerName: string;
  planName: string;
  endDate: string;
  price: number;
  daysLeft: number;
}

export function RenewalReminderEmail({
  customerName,
  planName,
  endDate,
  price,
  daysLeft,
}: RenewalReminderEmailProps) {
  const previewText = `Gói dịch vụ ${planName} của bạn sẽ hết hạn trong ${daysLeft} ngày`;

  return (
    <BaseTemplate previewText={previewText}>
      <Text style={styles.greeting}>Xin chào {customerName},</Text>

      <Text style={styles.paragraph}>
        Đây là thông báo nhắc nhở về việc gia hạn gói dịch vụ của bạn.
      </Text>

      <Section style={styles.alertBox}>
        <Text style={styles.alertText}>
          ⚠️ Gói dịch vụ <strong>{planName}</strong> của bạn sẽ hết hạn trong{' '}
          <strong>{daysLeft} ngày</strong>
        </Text>
      </Section>

      <Section style={styles.detailsBox}>
        <table style={styles.table}>
          <tbody>
            <tr>
              <td style={styles.labelCell}>Gói dịch vụ:</td>
              <td style={styles.valueCell}>{planName}</td>
            </tr>
            <tr>
              <td style={styles.labelCell}>Ngày hết hạn:</td>
              <td style={styles.valueCell}>{formatDate(endDate)}</td>
            </tr>
            <tr>
              <td style={styles.labelCell}>Giá gia hạn:</td>
              <td style={styles.valueCell}>{formatCurrency(price, 'VND')}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Text style={styles.paragraph}>
        Để tiếp tục sử dụng dịch vụ mà không bị gián đoạn, vui lòng liên hệ với chúng tôi để
        gia hạn gói dịch vụ.
      </Text>

      <Section style={styles.buttonContainer}>
        <Button
          href="mailto:support@hoiquanplex.site"
          style={styles.button}
        >
          Liên hệ gia hạn
        </Button>
      </Section>

      <Text style={styles.footer}>
        Nếu bạn không gia hạn trước ngày hết hạn, gói dịch vụ sẽ tự động bị hủy và bạn sẽ
        quay về gói Free.
      </Text>

      <Text style={styles.footer}>
        Nếu bạn có câu hỏi, vui lòng liên hệ với chúng tôi tại{' '}
        <a href="mailto:support@hoiquanplex.site" style={styles.link}>
          support@hoiquanplex.site
        </a>
      </Text>
    </BaseTemplate>
  );
}

const styles = {
  greeting: {
    fontSize: '16px',
    lineHeight: '24px',
    marginBottom: '16px',
  },
  paragraph: {
    fontSize: '14px',
    lineHeight: '22px',
    color: '#374151',
    marginBottom: '16px',
  },
  alertBox: {
    backgroundColor: '#FEF3C7',
    border: '2px solid #F59E0B',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
  },
  alertText: {
    fontSize: '14px',
    lineHeight: '20px',
    color: '#92400E',
    margin: '0',
  },
  detailsBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
  },
  table: {
    width: '100%',
  },
  labelCell: {
    fontSize: '14px',
    color: '#6B7280',
    paddingBottom: '8px',
    width: '40%',
  },
  valueCell: {
    fontSize: '14px',
    color: '#111827',
    fontWeight: '600',
    paddingBottom: '8px',
  },
  buttonContainer: {
    textAlign: 'center' as const,
    marginTop: '24px',
    marginBottom: '24px',
  },
  button: {
    backgroundColor: '#1E40AF',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 32px',
  },
  footer: {
    fontSize: '13px',
    lineHeight: '20px',
    color: '#6B7280',
    marginTop: '16px',
  },
  link: {
    color: '#1E40AF',
    textDecoration: 'underline',
  },
};
