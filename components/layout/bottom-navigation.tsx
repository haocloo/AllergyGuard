'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

// ui
import { cn } from '@/lib/cn';
import { Baby, Gamepad2, List, Camera, AlertCircle, Book, Users } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
      ],
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
  const mobileNavItems = allMobileNavItems.filter((item) =>
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

  // Check if an item is active based on the current path
  const isItemActive = (item: MobileNavItem) => {
    // Special case for Scanner - must be exact path match
    if (item.title === 'Scanner') {
      return path === '/dashboard/meal-planning/scanner';
    }

    // Special case for Food List - highlight for any meal-planning path except scanner
    if (item.title === 'Food List') {
      return (
        path === '/dashboard/meal-planning' ||
        (path.startsWith('/dashboard/meal-planning/') &&
          path !== '/dashboard/meal-planning/scanner')
      );
    }

    // Other items - exact match or check subItems
    if (item.url === '#' && item.subItems) {
      return item.subItems.some((subItem) => path === subItem.url);
    }

    return path === item.url;
  };

  // Check if a specific path is active (for submenu items)
  const isPathActive = (itemUrl: string) => {
    return path === itemUrl;
  };

  if (!isVisible) return null;

  // Determine the grid columns class based on number of items
  const getGridColsClass = () => {
    switch (mobileNavItems.length) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-3';
      case 4:
        return 'grid-cols-4';
      case 5:
        return 'grid-cols-5';
      default:
        return 'grid-cols-5';
    }
  };

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 shadow-lg md:hidden">
      <div className={`grid h-full w-full mx-0 ${getGridColsClass()}`}>
        {mobileNavItems.map((item) => {
          const isActive = isItemActive(item);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const filteredSubItems = item.subItems?.filter((subItem) =>
            subItem.role.includes(user.role as T_role)
          );

          return (
            <div key={item.title} className="relative h-full w-full">
              {hasSubItems && filteredSubItems && filteredSubItems.length > 0 ? (
                <Popover
                  open={openSubMenu === item.title}
                  onOpenChange={(open) => setOpenSubMenu(open ? item.title : null)}
                >
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        'w-full h-full flex flex-col items-center justify-center gap-1',
                        'relative after:absolute after:top-0 after:left-0 after:right-0 after:h-0.5 after:transition-colors',
                        isActive || openSubMenu === item.title
                          ? 'text-primary dark:text-primary font-medium after:bg-primary'
                          : 'text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary after:bg-transparent'
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-xs">{item.title}</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-fit p-1 px-4 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800"
                    side="top"
                    align="center"
                    sideOffset={1}
                    avoidCollisions={true}
                  >
                    <div className="flex flex-col gap-1">
                      {filteredSubItems.map((subItem) => (
                        <Link
                          key={subItem.url}
                          href={subItem.url}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
                            isPathActive(subItem.url)
                              ? 'bg-primary/10 text-primary dark:text-primary font-medium'
                              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                          )}
                          onClick={() => setOpenSubMenu(null)}
                        >
                          <subItem.icon className="w-4 h-4" />
                          <span>{subItem.title}</span>
                        </Link>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <Link
                  href={item.url}
                  className={cn(
                    'flex flex-col items-center justify-center h-full w-full gap-1',
                    'relative after:absolute after:top-0 after:left-0 after:right-0 after:h-0.5 after:transition-colors',
                    isActive
                      ? 'text-primary dark:text-primary font-medium after:bg-primary'
                      : 'text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary after:bg-transparent'
                  )}
                >
                  <item.icon className="w-5 h-5" />
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
