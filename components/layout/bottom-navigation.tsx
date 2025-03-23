'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

// ui
import { cn } from '@/lib/cn';
import { Baby, Gamepad2, List, Camera, AlertCircle, Book, Users } from 'lucide-react';

// services
import { User } from '@/lib/lucia/auth';
import { T_role } from '@/services/types';

// Define the mobile navigation items - simplified version of important navigation items
type MobileNavItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  role: T_role[];
  subItems?: {
    title: string;
    url: string;
    icon: React.ElementType;
    role: T_role[];
  }[];
};

export default function BottomNavigation({ user }: { user: User }) {
  const path = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get only the most important navigation items for mobile
  const allMobileNavItems: MobileNavItem[] = [
    {
      title: 'Profiles',
      url: '#',
      icon: Users,
      role: ['admin', 'caretaker', 'parent'],
      subItems: [
        {
          title: 'Children',
          url: '/dashboard/profile-management',
          icon: Baby,
          role: ['admin', 'caretaker', 'parent'],
        },
        {
          title: 'Classroom',
          url: '/dashboard/classroom-management',
          icon: Book,
          role: ['admin', 'caretaker'],
        },
      ]
    },
    {
      title: 'Food List',
      url: '/dashboard/meal-planning',
      icon: List,
      role: ['admin', 'caretaker', 'parent'],
    },
    {
      title: 'Scanner',
      url: '/dashboard/meal-planning/scanner',
      icon: Camera,
      role: ['admin', 'caretaker', 'parent'],
    },
    {
      title: 'Diagnosis',
      url: '/dashboard/smart-diagnosis',
      icon: AlertCircle,
      role: ['admin', 'caretaker', 'parent'],
    },
    {
      title: 'Game',
      url: '/dashboard/allergy-ninja',
      icon: Gamepad2,
      role: ['admin', 'caretaker', 'parent'],
    },
  ];

  // Filter items based on user role
  const mobileNavItems = allMobileNavItems.filter(item => 
    item.role.includes(user.role as T_role)
  );

  // Check if the current screen size should show the bottom navigation
  useEffect(() => {
    const checkScreenSize = () => {
      setIsVisible(window.innerWidth < 768); // Same as tailwind's md breakpoint
    };

    // Initial check
    checkScreenSize();

    // Add event listener for resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close submenu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.bottom-nav-item')) {
        setOpenSubMenu(null);
      }
    };

    if (openSubMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openSubMenu]);

  if (!isVisible) return null;

  // Determine the grid columns class based on number of items
  const getGridColsClass = () => {
    switch (mobileNavItems.length) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      default: return 'grid-cols-5';
    }
  };

  // Check if a path is active including its children
  const isPathActive = (itemUrl: string) => {
    if (itemUrl === '#') {
      return false;
    }
    return path === itemUrl || path.startsWith(`${itemUrl}/`);
  };

  // Check if any subitems are active
  const hasActiveSubItem = (item: MobileNavItem) => {
    return item.subItems?.some(subItem => isPathActive(subItem.url));
  };

  // Handle mouse enter for submenu
  const handleMouseEnter = (title: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpenSubMenu(title);
  };

  // Handle mouse leave for submenu
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenSubMenu(null);
    }, 300);
  };

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 shadow-lg md:hidden">
      <div className={`grid h-full mx-auto ${getGridColsClass()}`}>
        {mobileNavItems.map((item) => {
          const isActive = isPathActive(item.url) || hasActiveSubItem(item);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          
          // Filter sub-items based on role if they exist
          const filteredSubItems = item.subItems?.filter(subItem => 
            subItem.role.includes(user.role as T_role)
          );

          return (
            <div 
              key={item.title} 
              className="bottom-nav-item relative"
              onMouseEnter={() => hasSubItems ? handleMouseEnter(item.title) : null}
              onMouseLeave={hasSubItems ? handleMouseLeave : undefined}
            >
              {hasSubItems && filteredSubItems && filteredSubItems.length > 0 ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenSubMenu(openSubMenu === item.title ? null : item.title);
                    }}
                    className={cn(
                      "w-full h-full flex flex-col items-center justify-center",
                      isActive || openSubMenu === item.title
                        ? "text-blue-600 dark:text-blue-400 font-medium" 
                        : "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                    )}
                  >
                    <item.icon className="w-5 h-5 mb-1" />
                    <span className="text-xs">{item.title}</span>
                  </button>
                  
                  {/* Sub-menu that appears when clicked or hovered */}
                  {openSubMenu === item.title && filteredSubItems.length > 0 && (
                    <div 
                      className="absolute bottom-16 left-0 right-0 bg-white dark:bg-slate-800 rounded-t-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                      onMouseEnter={() => handleMouseEnter(item.title)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {filteredSubItems.map((subItem) => (
                        <Link 
                          key={subItem.url}
                          href={subItem.url}
                          className={cn(
                            "flex items-center gap-2 px-4 py-3 text-xs font-medium",
                            isPathActive(subItem.url)
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                              : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          )}
                          onClick={() => setOpenSubMenu(null)}
                        >
                          <subItem.icon className="w-4 h-4" />
                          <span>{subItem.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.url}
                  className={cn(
                    "flex flex-col items-center justify-center h-full",
                    isActive 
                      ? "text-blue-600 dark:text-blue-400 font-medium" 
                      : "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                  )}
                >
                  <item.icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{item.title}</span>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 