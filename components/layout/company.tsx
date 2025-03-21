import { useState } from 'react';
import Image from 'next/image';

// ui
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronsUpDown, Plus } from 'lucide-react';
import { SidebarMenuButton } from '@/components/ui/sidebar';

// Define the company type for better type safety
type CompanyType = {
  name: string;
  logoUrl: string;
  plan: string;
};

const company: CompanyType[] = [
  {
    name: 'AllergyGuard',
    logoUrl: '/favicon/android-chrome-512x512.png',
    plan: 'Startup',
  },
];

export default function Company() {
  const [activeTeam, setActiveTeam] = useState(company[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className={`${company.length <= 1 ? 'pointer-events-none' : ''}`}
      >
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white text-sidebar-primary-foreground">
            <Image
              src={activeTeam.logoUrl}
              alt={`${activeTeam.name} logo`}
              width={16}
              height={16}
              quality={100}
              priority
              className="size-6 object-contain"
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{activeTeam.name}</span>
            <span className="truncate text-xs">{activeTeam.plan}</span>
          </div>
          {company.length > 1 && <ChevronsUpDown className="ml-auto" />}
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">Teams</DropdownMenuLabel>
        {company.map((team, index) => (
          <DropdownMenuItem
            key={team.name}
            onClick={() => setActiveTeam(team)}
            className="gap-2 p-2"
          >
            <div className="flex size-6 items-center justify-center rounded-sm border">
              <Image
                src={team.logoUrl}
                alt={`${team.name} logo`}
                width={16}
                height={16}
                className="size-4 shrink-0 object-contain"
              />
            </div>
            {team.name}
            <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 p-2">
          <div className="flex size-6 items-center justify-center rounded-md border bg-background">
            <Plus className="size-4" />
          </div>
          <div className="font-medium text-muted-foreground">Add team</div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
