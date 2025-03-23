'use client';

import { Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import type { Classroom } from './types';

interface Props {
  classroom: Classroom;
}

// Update background images to be more classroom/education themed
const CLASSROOM_BACKGROUNDS = [
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1080&auto=format&fit=crop', // colorful classroom
  'https://images.unsplash.com/photo-1448932252197-d19750584e56?q=80&w=1080&auto=format&fit=crop', // wooden texture
  'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1080&auto=format&fit=crop', // pastel classroom
  'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=1080&auto=format&fit=crop', // bright classroom
];

export function ClassroomCard({ classroom }: Props) {
  const [backgroundImage, setBackgroundImage] = useState('');

  // Function to get a consistent background image based on classroom name
  const getBackgroundImage = (name: string) => {
    const charSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return CLASSROOM_BACKGROUNDS[charSum % CLASSROOM_BACKGROUNDS.length];
  };

  useEffect(() => {
    setBackgroundImage(getBackgroundImage(classroom.name));
  }, [classroom.name]);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
      {/* Background Image with Overlay - reduced height */}
      <div className="relative h-[160px] w-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content Section - reduced padding */}
      <div className="p-3 bg-white dark:bg-gray-950">
        {/* Classroom Info */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold">{classroom.name}</h3>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{classroom.children?.length || 0}</span>
          </div>
        </div>

        {/* Teacher Info - slightly smaller */}
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={classroom.teacher.photoUrl} />
            <AvatarFallback>{classroom.teacher.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium leading-none">{classroom.teacher.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{classroom.teacher.role}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
