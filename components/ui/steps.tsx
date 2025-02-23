// app/(routes)/(private)/dashboard/facility/book/_comp/steps.tsx
import { cn } from '@/lib/cn';
import { Check } from 'lucide-react';

interface StepsProps {
  steps: ReadonlyArray<{ id: number; title: string }>;
  currentStep: number;
}

export function Steps({ steps, currentStep }: StepsProps) {
  return (
    <div className="relative">
      <div className="absolute left-0 top-[15px] w-full h-0.5 bg-muted" />
      <div className="relative z-10 flex justify-between">
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border transition-colors',
                  isCompleted
                    ? 'bg-primary border-primary text-primary-foreground'
                    : isCurrent
                    ? 'bg-background border-primary text-primary'
                    : 'bg-background border-muted text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <span
                className={cn(
                  'mt-2 text-sm font-medium',
                  isCurrent ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
