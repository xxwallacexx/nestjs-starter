import { Body, Container, Font, Head, Hr, Html, Preview, Section, Tailwind, Text } from '@react-email/components';
import * as React from 'react';
import { Footer } from 'src/emails/components/footer.template';

interface LayoutProps {
  children: React.ReactNode;
  preview: string;
}

export const Layout = ({ children, preview }: LayoutProps) => (
  <Html>
    <Tailwind
      config={{
        // eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module
        presets: [require('tailwindcss-preset-email')],
        theme: {
          extend: {
            colors: {
              // Light Theme
            },
            fontFamily: {
              sans: ['Overpass', 'sans-serif'],
              mono: ['Overpass Mono', 'monospace'],
            },
          },
        },
      }}
    >
      <Head>
        <Font
          fontFamily="Overpass"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: 'https://fonts.gstatic.com/s/overpass/v13/qFdH35WCmI96Ajtm81GrU9vyww.woff2',
            format: 'woff2',
          }}
          fontWeight={'100 900'}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body className="bg-[#F4F4f4] my-auto mx-auto px-2 font-sans text-base text-gray-800">
        <Container className="my-[40px] mx-auto max-w-[465px]">
          <Section className="my-6 p-12 border border-red-400 rounded-[50px] bg-gray-50">{children}</Section>

          <Hr className="my-2 text-gray-500" />

          <Footer />
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

Layout.PreviewProps = {
  preview: 'This is the preview shown on some mail clients',
  children: <Text>Email body goes here.</Text>,
} as LayoutProps;

export default Layout;
