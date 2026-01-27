import React from 'react';
import { Navbar } from './layout/Navbar';
import { Footer } from './layout/Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const MarketingLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};
