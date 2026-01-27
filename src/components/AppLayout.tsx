import React from 'react';
import { Navbar } from './layout/Navbar';
import { Footer } from './layout/Footer';
import { LimitReachedModal } from '@/components/ui/LimitReachedModal';

interface LayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 container mx-auto px-4 max-w-7xl animate-fade-in">
        {children}
      </main>
      <Footer />
      <LimitReachedModal />
    </div>
  );
};

export default AppLayout;
