import { Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import { IButton } from 'src/emails/components/button.component';
import Layout from 'src/emails/components/layout';
import { WelcomeEmailProps } from 'src/repositories/notification.repository';
import { replaceTemplateTags } from 'src/utils/replace-template-tags';

export const WelcomeEmail = ({ baseUrl, displayName, username, password, customTemplate }: WelcomeEmailProps) => {
  const usableTemplateVariables = {
    displayName,
    username,
    password,
    baseUrl,
  };

  const emailContent = customTemplate ? (
    replaceTemplateTags(customTemplate, usableTemplateVariables)
  ) : (
    <>
      <Text className="m-0">
        Hey <strong>{displayName}</strong>!
      </Text>

      <Text>A new account has been created for you.</Text>

      <Text>
        <strong>Username</strong>: {username}
        {password && (
          <>
            <br />
            <strong>Password</strong>: {password}
          </>
        )}
      </Text>
    </>
  );

  return (
    <Layout preview={customTemplate ? emailContent.toString() : 'You have been invited to a new instance.'}>
      {customTemplate && (
        <Text className="m-0">
          <div dangerouslySetInnerHTML={{ __html: emailContent }}></div>
        </Text>
      )}

      {!customTemplate && emailContent}

      <Section className="flex justify-center my-6">
        <IButton href={`${baseUrl}/auth/login`}>Login</IButton>
      </Section>

      <Text className="text-xs">
        If you cannot click the button use the link below to proceed with first login.
        <br />
        <Link href={baseUrl}>{baseUrl}</Link>
      </Text>
    </Layout>
  );
};

WelcomeEmail.PreviewProps = {
  baseUrl: 'https://demo.fat.app/auth/login',
  displayName: 'Wallace Wong',
  username: 'wallacewong@fetchapptech.com',
  password: 'mypassword',
} as WelcomeEmailProps;

export default WelcomeEmail;
