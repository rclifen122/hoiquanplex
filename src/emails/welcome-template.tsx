
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Tailwind,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
    name: string;
    loginUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hoiquanplex.site';

export const WelcomeEmail = ({
    name = 'Quý khách',
    loginUrl = `${baseUrl}/customer/login`,
}: WelcomeEmailProps) => {
    const previewText = `Chào mừng ${name} đến với Hội Quán Plex!`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-gray-100 font-sans">
                    <Container className="mx-auto my-10 max-w-2xl rounded bg-white p-8">
                        <Section className="mt-4 text-center">
                            {/* Logo placeholder - replace with actual logo URL if available */}
                            <Heading className="text-2xl font-bold text-gray-800">
                                HỘI QUÁN PLEX
                            </Heading>
                        </Section>

                        <Heading className="text-xl font-bold text-gray-800">
                            Xin chào {name},
                        </Heading>

                        <Text className="text-gray-600">
                            Cảm ơn bạn đã đăng ký tài khoản tại Hội Quán Plex. Chúng tôi rất vui mừng được phục vụ nhu cầu giải trí của bạn.
                        </Text>

                        <Section className="my-6 text-center">
                            <Button
                                className="rounded bg-blue-600 px-6 py-3 font-semibold text-white no-underline"
                                href={loginUrl}
                            >
                                Đăng Nhập Tài Khoản
                            </Button>
                        </Section>

                        <Text className="text-gray-600">
                            Để bắt đầu sử dụng dịch vụ, vui lòng:
                            <ol className="ml-4 list-decimal">
                                <li>Đăng nhập vào Portal khách hàng</li>
                                <li>Chọn gói đăng ký phù hợp</li>
                                <li>Thanh toán để kích hoạt tài khoản</li>
                            </ol>
                        </Text>

                        <Hr className="my-6 border-gray-300" />

                        <Text className="text-sm text-gray-500">
                            Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.
                            <br />
                            Hội Quán Plex - Giải trí đỉnh cao
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default WelcomeEmail;
