
import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
    Tailwind,
    Column,
    Row,
} from '@react-email/components';
import * as React from 'react';

interface PaymentPendingEmailProps {
    name: string;
    paymentCode: string;
    amount: string;
    planName: string;
    bankInfo: {
        bankName: string;
        accountNumber: string;
        accountName: string;
    };
}

export const PaymentPendingEmail = ({
    name = 'Quý khách',
    paymentCode = 'HQP-XXXXXX',
    amount = '0 VND',
    planName = 'Gói Pro',
    bankInfo = {
        bankName: 'Vietcombank',
        accountNumber: '0000000000',
        accountName: 'NGUYEN VAN A',
    },
}: PaymentPendingEmailProps) => {
    const previewText = `Hướng dẫn thanh toán đơn hàng ${paymentCode} - Hội Quán Plex`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-gray-100 font-sans">
                    <Container className="mx-auto my-10 max-w-2xl rounded bg-white p-8">
                        <Heading className="text-2xl font-bold text-blue-700">
                            Xác nhận đơn hàng
                        </Heading>

                        <Text className="text-gray-600">
                            Chào {name},<br />
                            Hệ thống đã nhận được yêu cầu đăng ký <strong>{planName}</strong> của bạn.
                        </Text>

                        <Section className="my-6 rounded-lg bg-yellow-50 p-6 border border-yellow-200">
                            <Heading as="h3" className="m-0 text-lg font-bold text-yellow-800">
                                Thông tin thanh toán
                            </Heading>

                            <div className="mt-4">
                                <Text className="my-1 text-gray-700"><strong>Ngân hàng:</strong> {bankInfo.bankName}</Text>
                                <Text className="my-1 text-gray-700"><strong>Số tài khoản:</strong> {bankInfo.accountNumber}</Text>
                                <Text className="my-1 text-gray-700"><strong>Chủ tài khoản:</strong> {bankInfo.accountName}</Text>
                                <Text className="my-1 text-gray-700"><strong>Số tiền:</strong> <span className="text-red-600 font-bold">{amount}</span></Text>

                                <Hr className="border-yellow-200 my-4" />

                                <Text className="my-1 text-lg font-bold text-center">
                                    Nội dung chuyển khoản: <br />
                                    <span className="text-2xl text-blue-600 bg-white px-4 py-2 rounded border border-blue-200 inline-block mt-2">
                                        {paymentCode}
                                    </span>
                                </Text>
                            </div>
                        </Section>

                        <Text className="text-sm text-gray-500 italic">
                            * Vui lòng chuyển khoản đúng nội dung để hệ thống tự động ghi nhận (nếu có).
                            <br />
                            * Đơn hàng sẽ hết hạn sau 24 giờ.
                        </Text>

                        <Hr className="my-6 border-gray-300" />

                        <Text className="text-center text-gray-500 text-sm">
                            Cần hỗ trợ? Liên hệ Admin qua Facebook hoặc Zalo.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default PaymentPendingEmail;
