import { Link, Row, Text } from '@react-email/components';
import * as React from 'react';
import Layout from 'src/emails/components/layout';
import { TestEmailProps } from 'src/repositories/notification.repository';

export const TestEmail = ({ baseUrl, displayName }: TestEmailProps) => (
  <Layout preview="This is a test email from App.">
    <Text className="m-0">
      Hey <strong>{displayName}</strong>!
    </Text>

    <Text>This is a test email from your App Instance!</Text>

    <Row>
      <Link href={baseUrl}>{baseUrl}</Link>
    </Row>
  </Layout>
);

TestEmail.PreviewProps = {
  baseUrl: 'https://demo.fat.app',
  displayName: 'Wallace Wong',
} as TestEmailProps;

export default TestEmail;
