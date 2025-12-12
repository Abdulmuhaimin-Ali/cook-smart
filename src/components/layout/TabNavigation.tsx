
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Scan, List, BarChart, FileText } from 'lucide-react';
// let's see if code clarity picks this up
const TabNavigation = () => {
  const location = useLocation();
  
  const tabs = [
    { path: '/', icon: <Scan size={24} />, label: 'Scan' },
    { path: '/meal-generator', icon: <FileText size={24} />, label: 'Generate' },
    { path: '/inventory', icon: <List size={24} />, label: 'Inventory' },
    { path: '/stats', icon: <BarChart size={24} />, label: 'Stats' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="flex justify-around items-center py-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                "flex flex-col items-center p-2 w-1/4 transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.icon}
              <span className="text-xs mt-1">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TabNavigation;
