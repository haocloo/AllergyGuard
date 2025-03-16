'use client';

import { Badge } from '@/components/ui/badge';

type AllergenBadgeProps = {
  allergen: string;
  severity?: 'High' | 'Medium' | 'Low';
};

const severityColors = {
  High: 'bg-red-500 hover:bg-red-600',
  Medium: 'bg-orange-500 hover:bg-orange-600',
  Low: 'bg-yellow-500 hover:bg-yellow-600',
  Default: 'bg-blue-500 hover:bg-blue-600',
};

export function AllergenBadge({ allergen, severity }: AllergenBadgeProps) {
  const colorClass = severity ? severityColors[severity] : severityColors.Default;

  return (
    <Badge className={`${colorClass} text-white mx-1 my-1`}>
      {allergen}
      {severity ? ` (${severity})` : ''}
    </Badge>
  );
}
