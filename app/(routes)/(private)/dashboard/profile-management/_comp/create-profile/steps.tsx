'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { motion } from 'framer-motion';

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface Props {
  steps: Step[];
  currentStep: number;
}

export function Steps({ steps, currentStep }: Props) {
  return (
    <div className="relative">
      <div className="absolute left-0 top-[15px] h-[2px] w-full bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
      </div>

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
            <motion.div
              initial={false}
              animate={{
                scale: i === currentStep ? 1.1 : 1,
                backgroundColor: i <= currentStep ? 'var(--primary)' : 'var(--background)',
              }}
              className={cn(
                'h-8 w-8 rounded-full border-2 flex items-center justify-center',
                'transition-colors duration-500',
                i === currentStep
                  ? 'border-primary text-primary-foreground'
                  : i < currentStep
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted text-muted-foreground'
              )}
            >
              {i < currentStep ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Check className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm"
                >
                  {i + 1}
                </motion.span>
              )}
            </motion.div>

            <div className="hidden sm:flex flex-col items-center">
              <motion.span
                initial={false}
                animate={{
                  color:
                    i === currentStep
                      ? 'var(--primary)'
                      : i < currentStep
                      ? 'var(--foreground)'
                      : 'var(--muted-foreground)',
                }}
                className="text-xs font-medium"
              >
                {step.title}
              </motion.span>
              <span className="text-xs text-muted-foreground">{step.description}</span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: i === currentStep ? 1 : 0,
                y: i === currentStep ? 0 : 10,
              }}
              className="sm:hidden absolute -bottom-8 left-0 right-0 text-center"
            >
              <span className="text-sm font-medium text-primary">{step.title}</span>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
