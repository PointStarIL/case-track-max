
import React, { useState, useEffect, ReactNode } from 'react';
import { Menu, X, Briefcase, Home, List, Settings, PlusCircle, BarChart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const sidebarItems: NavItem[] = [
  { label: 'Dashboard', icon: Home, href: '/' },
  { label: 'Cases', icon: Briefcase, href: '/cases' },
  { label: 'Tasks', icon: List, href: '/tasks' },
  { label: 'Reports', icon: BarChart, href: '/reports' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Check if we're on mobile on mount and when window resizes
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Initial check
    checkMobile();

    // Add event listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar - always visible */}
      <header className="w-full h-16 px-4 glass-effect border-b z-30 fixed top-0 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-2"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          <h1 className="text-xl font-medium">Case Track Max</h1>
        </div>
        <div className="flex items-center">
          <Link to="/cases/new">
            <Button className="flex items-center gap-1">
              <PlusCircle size={16} />
              <span className="hidden sm:inline">New Case</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Sidebar - conditional rendering based on state */}
      <div className="flex flex-1 pt-16">
        <aside
          className={cn(
            "fixed inset-y-0 pt-16 w-64 glass-effect border-r z-20 transition-all duration-300 ease-spring",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            isMobile && sidebarOpen ? "shadow-xl" : ""
          )}
        >
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <div
                  className={cn(
                    "flex items-center py-3 px-4 rounded-md text-sm font-medium transition-all",
                    "hover:bg-accent hover:text-accent-foreground",
                    location.pathname === item.href || 
                    (item.href !== '/' && location.pathname.startsWith(item.href))
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Overlay for mobile when sidebar is open */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/30 z-10 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main 
          className={cn(
            "flex-1 transition-all duration-300 ease-spring p-6 pt-16",
            sidebarOpen && !isMobile ? "md:ml-64" : ""
          )}
        >
          <div className="w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
