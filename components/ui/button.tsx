import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        warning: 'bg-orange-500 text-white hover:bg-orange-600',
        success:
          'bg-green-600 text-white hover:bg-green-600/90 dark:bg-green-600/80 dark:hover:bg-green-600/70',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        magical:
          'bg-purple-600 text-white hover:bg-purple-500 dark:bg-purple-500 dark:hover:bg-purple-400 dark:text-white shadow-[0_0_15px_rgba(168,85,247,0.35)] hover:shadow-[0_0_25px_rgba(168,85,247,0.45)]',
        cosmic:
          'bg-indigo-600/90 text-white hover:bg-indigo-500/90 dark:bg-indigo-500/90 dark:hover:bg-indigo-400/90 dark:text-white shadow-[0_0_15px_rgba(99,102,241,0.35)] hover:shadow-[0_0_25px_rgba(99,102,241,0.45)]',
        ethereal:
          'bg-cyan-600/90 text-white hover:bg-cyan-500/90 dark:bg-cyan-500/90 dark:hover:bg-cyan-400/90 dark:text-white shadow-[0_0_15px_rgba(34,211,238,0.35)] hover:shadow-[0_0_25px_rgba(34,211,238,0.45)]',
        roundlightgreen:
          'px-4 py-2 text-sm font-semibold text-green-700 bg-green-100 rounded-full hover:bg-green-200',
        roundred:
          'px-4 py-2 text-sm font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200',
        roundyellow:
          'px-4 py-2 text-sm font-semibold text-yellow-700 bg-yellow-100 rounded-full hover:bg-yellow-200',
        roundblue:
          'px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200',
        orange: 'bg-orange-500 text-white hover:bg-orange-600',
        blue: 'bg-blue-500 text-white hover:bg-blue-600',
        red: 'bg-red-100 text-red-700 hover:bg-red-200',
        lightgreen: 'bg-green-100 text-green-700 hover:bg-green-200',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        type="button"
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
