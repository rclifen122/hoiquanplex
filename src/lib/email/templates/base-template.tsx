import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
} from '@react-email/components';

interface BaseTemplateProps {
  children: React.ReactNode;
  previewText?: string;
}

export function BaseTemplate({ children }: BaseTemplateProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.logo}>HoiQuanPlex</Text>
            <Text style={styles.tagline}>Customer Management System</Text>
          </Section>

          {/* Content */}
          <Section style={styles.content}>{children}</Section>

          {/* Footer */}
          <Hr style={styles.hr} />
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              © 2025 HoiQuanPlex. All rights reserved.
            </Text>
            <Text style={styles.footerText}>
              Website:{' '}
              <Link href="https://hoiquanplex.site" style={styles.link}>
                hoiquanplex.site
              </Link>
            </Text>
            <Text style={styles.footerText}>
              Bạn nhận được email này vì bạn đã đăng ký dịch vụ HoiQuanPlex.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: '#f6f9fc',
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
  },
  header: {
    padding: '32px 24px',
    textAlign: 'center' as const,
    backgroundColor: '#1e40af',
  },
  logo: {
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0',
  },
  tagline: {
    color: '#93c5fd',
    fontSize: '14px',
    margin: '8px 0 0 0',
  },
  content: {
    padding: '24px',
  },
  hr: {
    borderColor: '#e6e6e6',
    margin: '20px 0',
  },
  footer: {
    padding: '0 24px',
    textAlign: 'center' as const,
  },
  footerText: {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    margin: '4px 0',
  },
  link: {
    color: '#1e40af',
    textDecoration: 'underline',
  },
};
