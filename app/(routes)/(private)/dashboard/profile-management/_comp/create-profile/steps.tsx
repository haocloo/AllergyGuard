import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Step {
  title: string;
  description: string;
}

interface Props {
  steps: Step[];
  currentStep: number;
}

export function Steps({ steps, currentStep }: Props) {
  return (
    <div className="relative after:absolute after:left-0 after:top-[15px] after:h-[2px] after:w-full after:bg-muted">
      <div className="relative z-10 flex justify-between">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className={cn(
              'flex flex-col items-center space-y-2',
              i !== 0 && 'pl-4',
              i !== steps.length - 1 && 'pr-4'
            )}
          >
            <div
              className={cn(
                'h-8 w-8 rounded-full border-2 flex items-center justify-center',
                'bg-background transition-colors duration-500',
                i === currentStep
                  ? 'border-primary text-primary'
                  : i < currentStep
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted text-muted-foreground'
              )}
            >
              {i < currentStep ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-sm">{i + 1}</span>
              )}
            </div>
            <div className="hidden sm:flex flex-col items-center">
              <span
                className={cn(
                  'text-xs font-medium',
                  i === currentStep
                    ? 'text-primary'
                    : i < currentStep
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {step.title}
              </span>
              <span className="text-xs text-muted-foreground">{step.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
