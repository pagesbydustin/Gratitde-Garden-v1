
import type { Metadata } from 'next';
import { Lora } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { GlobalHeader } from '@/components/layout/GlobalHeader';
import { UserProvider } from '@/context/UserContext';
import { SettingsProvider } from '@/context/SettingsContext';

const lora = Lora({ subsets: ['latin'], variable: '--font-lora' });

export const metadata: Metadata = {
  title: 'Gratitude Garden',
  description: 'A place to cultivate joy and reflection, one entry at a time.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased', lora.variable)}>
        <SettingsProvider>
            <UserProvider>
                <GlobalHeader />
                {children}
                <Toaster />
            </UserProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
