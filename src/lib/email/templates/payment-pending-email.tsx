
import { Text, Section } from '@react-email/components';
import { BaseTemplate } from './base-template';

interface PaymentPendingEmailProps {
    customerName: string;
    paymentCode: string;
    amount: string;
    planName: string;
    bankInfo?: {
        bankName: string;
        accountNumber: string;
        accountName: string;
    };
}

export function PaymentPendingEmail({
    customerName,
    paymentCode,
    amount,
    planName,
    bankInfo = {
        bankName: process.env.BANK_NAME || 'Vietcombank',
        accountNumber: process.env.BANK_ACCOUNT_NUMBER || '0000000000',
        accountName: process.env.BANK_ACCOUNT_NAME || 'HOI QUAN PLEX',
    },
}: PaymentPendingEmailProps) {
    return (
        <BaseTemplate previewText={`Hướng dẫn thanh toán đơn hàng ${paymentCode}`}>
            <Text style={styles.heading}>Xác nhận đăng ký {planName}</Text>

            <Text style={styles.text}>
                Chào <strong>{customerName}</strong>,
            </Text>

            <Text style={styles.text}>
                Cảm ơn bạn đã đăng ký gói dịch vụ <strong>{planName}</strong>.
                Vui lòng hoàn tất thanh toán để kích hoạt tài khoản.
            </Text>

            <Section style={styles.infoBox}>
                <Text style={styles.infoTitle}>Thông tin chuyển khoản</Text>

                <div style={styles.infoRow}>
                    <Text style={styles.label}>Ngân hàng:</Text>
                    <Text style={styles.value}>{bankInfo.bankName}</Text>
                </div>

                <div style={styles.infoRow}>
                    <Text style={styles.label}>Số tài khoản:</Text>
                    <Text style={styles.value}>{bankInfo.accountNumber}</Text>
                </div>

                <div style={styles.infoRow}>
                    <Text style={styles.label}>Chủ tài khoản:</Text>
                    <Text style={styles.value}>{bankInfo.accountName}</Text>
                </div>

                <div style={styles.infoRow}>
                    <Text style={styles.label}>Số tiền:</Text>
                    <Text style={{ ...styles.value, ...styles.price }}>{amount} VND</Text>
                </div>

                <div style={styles.divider} />

                <div style={{ textAlign: 'center' }}>
                    <Text style={styles.label}>Nội dung chuyển khoản:</Text>
                    <div style={styles.codeBox}>{paymentCode}</div>
                </div>
            </Section>

            <Text style={styles.note}>
                * Lưu ý: Đơn hàng sẽ tự động hủy sau 24 giờ nếu chưa thanh toán.
            </Text>

            <Text style={styles.text}>
                Sau khi chuyển khoản, Admin sẽ xác nhận và gửi email kích hoạt tài khoản cho bạn trong thời gian sớm nhất.
            </Text>

            <Text style={styles.text}>
                Trân trọng,<br />
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
        margin: '12px 0',
        color: '#333333',
    },
    infoBox: {
        backgroundColor: '#fff9db', // Light yellow
        borderRadius: '12px',
        padding: '24px',
        margin: '24px 0',
        border: '1px solid #facc15',
    },
    infoTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#854d0e', // Dark yellow/brown
        marginBottom: '16px',
        marginTop: 0,
        textAlign: 'center' as const,
    },
    infoRow: {
        display: 'flex',
        marginBottom: '8px',
    },
    label: {
        fontWeight: 'bold',
        color: '#555',
        marginRight: '8px',
        display: 'inline-block',
        minWidth: '100px',
    },
    value: {
        color: '#000',
        display: 'inline-block',
    },
    price: {
        color: '#dc2626',
        fontWeight: 'bold' as const,
        fontSize: '18px',
    },
    divider: {
        borderTop: '1px dashed #ca8a04',
        margin: '16px 0',
    },
    codeBox: {
        backgroundColor: '#ffffff',
        border: '2px dashed #1e40af',
        color: '#1e40af',
        fontSize: '24px',
        fontWeight: 'bold',
        padding: '12px 24px',
        borderRadius: '8px',
        display: 'inline-block',
        marginTop: '8px',
    },
    note: {
        fontSize: '14px',
        fontStyle: 'italic',
        color: '#666',
        margin: '16px 0',
    },
};
