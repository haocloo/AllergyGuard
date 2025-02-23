// components/ui/stock-progress.tsx
import { cn } from '@/lib/cn';
import { AlertTriangle } from 'lucide-react';

interface StockProgressProps {
  value: number;
  className?: string;
  showWarning?: boolean;
}

export function StockProgress({ value, className, showWarning = true }: StockProgressProps) {
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage > 0) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-2">
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn('h-full transition-all duration-500', getProgressColor(value), className)}
          style={{ width: `${value}%` }}
        />
      </div>
      {showWarning && value <= 20 && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-red-500/10 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs">Critical stock level</span>
        </div>
      )}
      {showWarning && value > 20 && value <= 50 && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-orange-500/10 text-orange-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs">Low stock level</span>
        </div>
      )}
    </div>
  );
}
