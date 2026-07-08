import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Franklin Photo',
  description: 'Prémium fotóstúdió és Privát Galéria',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
