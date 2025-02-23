'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// ui
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronsUpDown, BadgeCheck, LogOut, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// services
import { lucia_logout } from '@/services/server';
import type { User } from '@/lib/lucia/auth';

// pui
import { ThemeToggle } from './theme-toggle';

export function UserNav({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user.photo} alt={user.name} />
            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.name}</span>
            <span className="truncate text-xs">{user.email}</span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.photo} alt={user.name} />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {/* <Link
            href={user.role === 'condo_manager' ? '/dashboard/resume/update' : '/dashboard/jobs/company'}
            className="flex w-full items-center gap-2"
          >
            <DropdownMenuItem className="w-full">
              <BadgeCheck className="h-4 w-4" />
              <span>Account</span>
            </DropdownMenuItem>
          </Link> */}
          {/* <DropdownMenuSeparator />
          <DropdownMenuItem className="p-0.5" onSelect={(e) => e.preventDefault()}>
            <LocaleSelector />
          </DropdownMenuItem> */}
          <DropdownMenuItem className="p-0.5" onSelect={(e) => e.preventDefault()}>
            <ThemeToggle />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            try {
              await lucia_logout();

              setLoading(true);
              toast({
                variant: 'success',
                title: 'Success',
                description: 'Logged out successfully',
              });
            } catch (error) {
              toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to log out',
              });
            } finally {
              setLoading(false);
              window.location.href = '/';
            }
          }}
        >
          <LogOut />
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Log out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
