'use client';

import { useProfileStore } from './store';
import { ChildCard } from './shared/child-card';
import { Baby } from 'lucide-react';

export function ChildrenGrid() {
  const { children, isLoading } = useProfileStore();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-[200px] rounded-lg border-2 border-dashed animate-pulse bg-muted"
          />
        ))}
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed rounded-lg">
        <Baby className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">No children profiles yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Add your first child profile to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {children.map((child) => (
        <ChildCard key={child.id} child={child} />
      ))}
    </div>
  );
}
