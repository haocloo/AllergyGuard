'use client';

import { useState } from 'react';
import { format, differenceInYears } from 'date-fns';
import { MoreVertical, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useProfileStore } from '../store';
import type { Child } from '../types';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';

interface Props {
  child: Child;
}

export function ChildCard({ child }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteChild } = useProfileStore();
  const { toast } = useToast();
  const router = useRouter();

  const age = differenceInYears(new Date(), new Date(child.dob));

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      deleteChild(child.id);
      toast({
        title: 'Success',
        description: 'Child profile deleted successfully',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete child profile',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/dashboard/profile-management/${child.id}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        'hover:shadow-md hover:border-primary/50 cursor-pointer group'
      )}
    >
      {/* Profile Picture Section */}
      <div className="relative w-full h-48 bg-muted">
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="w-full h-full">
          {child.photoUrl ? (
            <img src={child.photoUrl} alt={child.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Avatar className="h-32 w-32">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${child.id}`}
                  className="bg-background"
                />
                <AvatarFallback>{child.name[0]}</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </div>

      {/* Actions Menu */}
      <div className="absolute top-4 right-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Profile
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardContent className="pt-4 pb-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {child.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {age} years old • Born {format(new Date(child.dob), 'PP')}
            </p>
          </div>

          {child.allergies.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-1 text-sm font-medium text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                Allergies
              </div>
              <div className="flex flex-wrap justify-center gap-1">
                {child.allergies.map((allergy, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className={cn(
                      'border-2',
                      allergy.severity === 'High' && 'border-destructive text-destructive',
                      allergy.severity === 'Medium' && 'border-yellow-500 text-yellow-700',
                      allergy.severity === 'Low' && 'border-green-500 text-green-700'
                    )}
                  >
                    {allergy.allergen}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
