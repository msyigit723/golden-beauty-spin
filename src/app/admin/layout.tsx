import * as React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] bg-gray-50 flex-col md:flex-row">
      {/* Admin Sidebar Placeholder */}
      <aside className="w-full md:w-64 bg-luxury-black text-white p-6 flex-shrink-0 flex flex-col">
        <div className="font-serif text-xl font-bold tracking-widest mb-8 text-luxury-gold">
          GOLDEN ADMIN
        </div>
        <nav className="flex flex-col gap-4 text-sm font-medium">
          <div className="opacity-80">Dashboard</div>
          <div className="opacity-80">Kampanyalar</div>
          <div className="opacity-80">Kullanıcılar</div>
          <div className="opacity-80">Kazananlar</div>
        </nav>
      </aside>
      
      {/* Admin Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
