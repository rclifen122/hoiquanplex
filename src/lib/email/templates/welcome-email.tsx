import { Text, Button, Section } from '@react-email/components';
import { BaseTemplate } from './base-template';

interface WelcomeEmailProps {
  customerName: string;
  loginUrl?: string;
}

export function WelcomeEmail({ customerName, loginUrl }: WelcomeEmailProps) {
  return (
    <BaseTemplate previewText={`Chào mừng ${customerName} đến với HoiQuanPlex!`}>
      <Text style={styles.heading}>Xin chào {customerName}!</Text>

      <Text style={styles.text}>
        Chào mừng bạn đến với <strong>HoiQuanPlex CRM</strong> - hệ thống quản lý
        khách hàng của chúng tôi.
      </Text>

      <Text style={styles.text}>
        Tài khoản của bạn đã được tạo thành công. Bạn có thể bắt đầu sử dụng dịch
        vụ của chúng tôi ngay bây giờ.
      </Text>

      <Section style={styles.buttonContainer}>
        <Button
          style={styles.button}
          href={loginUrl || 'https://hoiquanplex.site/customer/login'}
        >
          Đăng nhập vào tài khoản
        </Button>
      </Section>

      <Text style={styles.text}>
        Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email
        hoặc Facebook.
      </Text>

      <Text style={styles.text}>
        Trân trọng,
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
    color: '#1e40af',
  },
  text: {
    fontSize: '16px',
    lineHeight: '24px',
    margin: '16px 0',
    color: '#333333',
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
