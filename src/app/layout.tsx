import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Naturally Rooted Salon',
  description:
    'A premium natural hair salon dedicated to healthy hair growth and organic care in Ibadan, Nigeria.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
