import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
