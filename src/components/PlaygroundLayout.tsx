import React, { useEffect } from 'react';
import { PlaygroundNavbar } from './layout/PlaygroundNavbar';
import { Footer } from './layout/Footer';
import { LimitReachedModal } from '@/components/ui/LimitReachedModal';
import { useAuthStore } from '@/store/authStore';
import { getMainDomainUrl } from '@/lib/subdomain';

interface LayoutProps {
  children: React.ReactNode;
}

export const PlaygroundLayout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // If we're on the playground and not authenticated (and not loading), redirect to main site
    if (!isLoading && !isAuthenticated) {
        window.location.href = getMainDomainUrl();
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>; // Or a better spinner
  }

  // If not authenticated, we render nothing while redirecting (or could show a message)
  if (!isAuthenticated) {
      return null; 
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans selection:bg-primary/20">
      <PlaygroundNavbar />
      <main className="flex-1 container mx-auto px-4 max-w-7xl pt-24 pb-12 animate-fade-in">
        {children}
      </main>
      <Footer />
      <LimitReachedModal />
    </div>
  );
};
