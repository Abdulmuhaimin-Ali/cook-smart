
import React from 'react';
import TabNavigation from './TabNavigation';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  hideNavigation?: boolean;
}

const Layout = ({ children, className, hideNavigation = false }: LayoutProps) => {
  return (
    <div className={cn("min-h-screen flex flex-col", className)}>
      <main className="flex-1 container pb-20 pt-5">
        {children}
      </main>
      {!hideNavigation && <TabNavigation />}
    </div>
  );
};

export default Layout;
