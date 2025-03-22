'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Copy, Check, Phone, Users, Filter, X, GraduationCap, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/cn';
import type { Classroom, Child } from '../../_comp/types';

interface Props {
  classroom: Classroom;
}

// Add food allergen icons mapping
const ALLERGEN_ICONS: Record<string, string> = {
  Peanuts: '🥜',
  Eggs: '🥚',
  Milk: '🥛',
  Shellfish: '🦐',
  Fish: '🐟',
  Soy: '🫘',
  Wheat: '🌾',
  Gluten: '🌾',
  Dairy: '🧀',
  Nuts: '🥜',
  Seafood: '🦞',
};

export function ClassroomDetails({ classroom }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAllergy, setSelectedAllergy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Filter children based on search and allergy filter
  const filteredChildren = classroom.children.filter((child) => {
    const matchesSearch = child.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAllergy = !selectedAllergy || child.allergies.includes(selectedAllergy);
    return matchesSearch && matchesAllergy;
  });

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(classroom.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Success',
        description: 'Classroom code copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy code',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Classroom Header - More compact */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            {classroom.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-xs bg-muted px-2 py-1 rounded">{classroom.code}</code>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-background/50"
              onClick={handleCopyCode}
            >
              {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Caretaker Info - More compact */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 ring-2 ring-primary/10">
            <AvatarImage src={classroom.teacher.photoUrl} />
            <AvatarFallback className="text-sm">
              {classroom.teacher.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="font-medium text-sm flex items-center gap-2">
              {classroom.teacher.name}
              <Badge variant="secondary" className="text-xs font-normal">
                {classroom.teacher.role}
              </Badge>
            </h3>
            <div className="flex flex-col gap-0.5 mt-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {classroom.teacher.phone}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Allergen Alerts - Grid layout for mobile */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium flex items-center gap-2">
            Allergen Alerts
            <Badge variant="outline" className="text-xs">
              {classroom.allergenAlerts.length}
            </Badge>
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {classroom.allergenAlerts.map((alert) => (
            <Card
              key={alert.name}
              className={cn(
                'p-2 cursor-pointer transition-all duration-200',
                selectedAllergy === alert.name
                  ? 'bg-primary/5 border-primary ring-1 ring-primary'
                  : 'hover:bg-muted/50 hover:scale-[1.02]'
              )}
              onClick={() => setSelectedAllergy(selectedAllergy === alert.name ? null : alert.name)}
            >
              <div className="flex items-center gap-2">
                <div className="text-lg" role="img" aria-label={alert.name}>
                  {ALLERGEN_ICONS[alert.name] || '⚠️'}
                </div>
                <div>
                  <p className="text-xs font-medium">{alert.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {alert.count} {alert.count === 1 ? 'child' : 'children'}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Children List - Improved mobile layout */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <h2 className="text-sm font-medium">Children</h2>
            <Badge variant="outline" className="text-xs">
              {classroom.children.length}
            </Badge>
          </div>
          <div className="flex-1 flex items-center gap-2">
            {selectedAllergy && (
              <Badge
                variant="secondary"
                className="text-xs flex items-center gap-1"
                onClick={() => setSelectedAllergy(null)}
              >
                {ALLERGEN_ICONS[selectedAllergy] || '⚠️'}
                {selectedAllergy}
                <X className="h-3 w-3 cursor-pointer" />
              </Badge>
            )}
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search children..."
                className="pl-8 h-8 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredChildren.map((child) => (
            <Card key={child.id} className="p-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                  <AvatarImage src={child.photoUrl} />
                  <AvatarFallback className="text-xs">
                    {child.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium truncate">{child.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {child.allergies.length > 0 ? (
                      child.allergies.map((allergy) => (
                        <div
                          key={allergy}
                          className={cn(
                            'inline-flex items-center text-xs gap-0.5 px-1.5 py-0.5 rounded-md',
                            selectedAllergy === allergy
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {ALLERGEN_ICONS[allergy] || '⚠️'}
                          {allergy}
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No allergies</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
