import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/cn';

interface InteractiveHoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  direction?: 'left' | 'right';
}

const InteractiveHoverButton = React.forwardRef<HTMLButtonElement, InteractiveHoverButtonProps>(
  ({ text = 'Button', direction = 'right', className, ...props }, ref) => {
    const Icon = direction === 'right' ? ArrowRight : ArrowLeft;
    const translateClass =
      direction === 'right'
        ? 'translate-x-1 group-hover:translate-x-12'
        : '-translate-x-1 group-hover:-translate-x-12';
    const iconTranslateClass =
      direction === 'right'
        ? 'translate-x-12 group-hover:-translate-x-1'
        : '-translate-x-12 group-hover:translate-x-1';

    return (
      <button
        ref={ref}
        className={cn(
          'group relative w-32 cursor-pointer overflow-hidden rounded-full border bg-background p-2 text-center font-semibold',
          className
        )}
        {...props}
      >
        <span
          className={`inline-block ${translateClass} transition-all duration-300 group-hover:opacity-0`}
        >
          {text}
        </span>
        <div
          className={`absolute top-0 z-10 flex h-full w-full ${iconTranslateClass} items-center justify-center gap-2 text-primary-foreground opacity-0 transition-all duration-300 group-hover:opacity-100`}
        >
          <span>{text}</span>
          <Icon />
        </div>
        <div className="absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg bg-primary transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8] group-hover:bg-primary"></div>
      </button>
    );
  }
);

InteractiveHoverButton.displayName = 'InteractiveHoverButton';

export default InteractiveHoverButton;

// Sample
/*
import InteractiveHoverButton from "@/components/magicui/interactive-hover-button";

export function InteractiveHoverButtonDemo() {
  return (
    <div className="relative justify-center">
      <InteractiveHoverButton />
    </div>
  );
}
*/
