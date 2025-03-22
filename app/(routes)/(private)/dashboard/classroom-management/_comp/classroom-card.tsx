'use client';

import { Users, GraduationCap, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { useEffect, useState } from 'react';
import type { Classroom } from './types';

interface Props {
  classroom: Classroom;
}

// Update the color combinations to be more vibrant but still professional
const colorPairs = [
  'from-blue-100/80 to-violet-200/80 dark:from-blue-900/40 dark:to-violet-900/40',
  'from-emerald-100/80 to-teal-200/80 dark:from-emerald-900/40 dark:to-teal-900/40',
  'from-orange-100/80 to-amber-200/80 dark:from-orange-900/40 dark:to-amber-900/40',
  'from-rose-100/80 to-pink-200/80 dark:from-rose-900/40 dark:to-pink-900/40',
  'from-cyan-100/80 to-sky-200/80 dark:from-cyan-900/40 dark:to-sky-900/40',
  'from-purple-100/80 to-fuchsia-200/80 dark:from-purple-900/40 dark:to-fuchsia-900/40',
  'from-lime-100/80 to-green-200/80 dark:from-lime-900/40 dark:to-green-900/40',
  'from-yellow-100/80 to-orange-200/80 dark:from-yellow-900/40 dark:to-orange-900/40',
];

export function ClassroomCard({ classroom }: Props) {
  const [gradientColor, setGradientColor] = useState(colorPairs[0]);

  // Function to get a consistent color based on teacher's name
  const getColorFromName = (name: string) => {
    const charSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colorPairs[charSum % colorPairs.length];
  };

  useEffect(() => {
    setGradientColor(getColorFromName(classroom.teacher.name));
  }, [classroom.teacher.name]);

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300',
        'hover:shadow-lg hover:scale-[1.02]',
        'cursor-pointer h-[160px]'
      )}
    >
      {/* Background with gradient */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br',
          gradientColor,
          'opacity-100 group-hover:opacity-90 transition-opacity'
        )}
      />

      {/* Content overlay with subtle backdrop blur */}
      <div className="absolute inset-0 bg-white/10 dark:bg-gray-950/10 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative p-4 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors">
            {classroom.name}
          </h3>
          <div className="flex items-center gap-2">
            {/* Class Label */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm">
              <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Class</span>
            </div>
            {/* Arrow Icon */}
            <div className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>

        {/* Bottom Section with Teacher Info and Children Count */}
        <div className="mt-auto space-y-2">
          {/* Teacher Info */}
          <div className="flex items-center gap-3 bg-background/80 backdrop-blur-sm rounded-full py-1.5 px-2">
            <Avatar className="h-8 w-8 ring-2 ring-background shadow-sm">
              <AvatarImage src={classroom.teacher.photoUrl} />
              <AvatarFallback className="bg-primary/10">{classroom.teacher.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none text-gray-800 dark:text-gray-100">
                {classroom.teacher.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Head Teacher</p>
            </div>
          </div>

          {/* Children Count */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm w-fit">
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs font-medium text-gray-800 dark:text-gray-100">
              {classroom.children?.length || 0} Children
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Update the AddClassroomCard to be more minimal
export function AddClassroomCard() {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300',
        'hover:shadow-lg hover:scale-[1.02] cursor-pointer',
        'flex items-center justify-center',
        'border-2 border-dashed h-[160px]',
        'bg-transparent hover:bg-muted/5'
      )}
    >
      <div className="text-center px-4">
        <div className="w-10 h-10 rounded-full border-2 border-primary/30 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
          <GraduationCap className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-medium text-primary text-sm">Add New Classroom</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-[160px]">
          Create a new classroom space
        </p>
      </div>
    </Card>
  );
}
