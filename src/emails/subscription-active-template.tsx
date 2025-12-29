
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
    Tailwind,
} from '@react-email/components';
import * as React from 'react';

interface SubscriptionActiveEmailProps {
    name: string;
    planName: string;
    endDate: string;
    dashboardUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hoiquanplex.site';

export const SubscriptionActiveEmail = ({
    name = 'Quý khách',
    planName = 'Gói Pro 12 Tháng',
    endDate = '01/01/2026',
    dashboardUrl = `${baseUrl}/customer`,
}: SubscriptionActiveEmailProps) => {
    const previewText = `Kích hoạt thành công gói ${planName} - Hội Quán Plex`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-gray-100 font-sans">
                    <Container className="mx-auto my-10 max-w-2xl rounded bg-white p-8">
                        <Section className="text-center mb-6">
                            <Heading className="text-3xl text-green-600 mb-2">🎉</Heading>
                            <Heading className="text-2xl font-bold text-green-700">
                                Thanh toán thành công!
                            </Heading>
                        </Section>

                        <Text className="text-gray-600">
                            Xin chào {name},<br />
                            Gói dịch vụ <strong>{planName}</strong> của bạn đã được kích hoạt thành công.
                        </Text>

                        <Section className="my-6 bg-gray-50 p-4 rounded border border-gray-200">
                            <Text className="m-0 text-gray-700">
                                <strong>Trạng thái:</strong> <span className="text-green-600 font-bold">ĐANG HOẠT ĐỘNG</span>
                            </Text>
                            <Text className="m-0 text-gray-700 mt-2">
                                <strong>Ngày hết hạn:</strong> {endDate}
                            </Text>
                        </Section>

                        <Section className="text-center my-8">
                            <Button
                                className="rounded bg-green-600 px-6 py-3 font-semibold text-white no-underline hover:bg-green-700"
                                href={dashboardUrl}
                            >
                                Truy cập Dashboard ngay
                            </Button>
                        </Section>

                        <Text className="text-gray-600">
                            Bạn có thể bắt đầu sử dụng dịch vụ trên hệ thống Plex ngay bây giờ.
                            Nếu cần hỗ trợ kỹ thuật, vui lòng liên hệ Admin.
                        </Text>

                        <Hr className="my-6 border-gray-300" />

                        <Text className="text-center text-gray-500 text-sm">
                            Cảm ơn bạn đã tin tưởng dịch vụ của Hội Quán Plex.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default SubscriptionActiveEmail;
