import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Golden Güzellik Hediye Kutusu',
  description: 'Premium hediye kampanyası',
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
        <header className="flex h-16 items-center justify-center border-b border-white/5 bg-luxury-bg-primary px-4">
          <div className="font-serif text-lg font-bold tracking-widest text-luxury-gold">GOLDEN BEAUTY</div>
        </header>
        <main className="flex-1 flex flex-col relative">
          {children}
        </main>
        <footer className="py-6 text-center text-xs text-luxury-text-muted/50">
          © {new Date().getFullYear()} Golden Güzellik
        </footer>
      </body>
    </html>
  );
}
