import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Golden Beauty Spin',
  description: 'Premium kampanya çarkı',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="antialiased min-h-[100dvh] flex flex-col">
        {/* Foundation Layout Placeholder for User Routes */}
        <header className="flex h-16 items-center justify-center border-b border-gray-100 bg-white px-4">
          <div className="font-serif text-lg font-bold tracking-widest text-luxury-black">GOLDEN</div>
        </header>
        <main className="flex-1 flex flex-col relative">
          {children}
        </main>
        <footer className="py-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Golden Beauty Spin
        </footer>
      </body>
    </html>
  );
}
