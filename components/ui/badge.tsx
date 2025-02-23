import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        primary:
          "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-600/20 dark:text-green-300 dark:hover:bg-green-600/30 border border-green-200 dark:border-green-700/30",
        blue: "bg-blue-100 text-blue-700 dark:bg-blue-700/20 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-600/30 border border-blue-200 dark:border-blue-700/30",
        orange:
          "bg-orange-100 text-orange-700 dark:bg-orange-700/20 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-600/30 border border-orange-200 dark:border-orange-700/30",
        yellow:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-600/30 border border-yellow-200 dark:border-yellow-700/30",
        purple:
          "bg-purple-100 text-purple-700 dark:bg-purple-700/20 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-600/30 border border-purple-200 dark:border-purple-700/30",
        pink: "bg-pink-100 text-pink-700 dark:bg-pink-700/20 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-600/30 border border-pink-200 dark:border-pink-700/30",
        gray: "bg-gray-100 text-gray-700 dark:bg-gray-700/20 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/30 border border-gray-200 dark:border-gray-700/30",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        warning: "border-transparent bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-600/20 dark:text-yellow-300 dark:hover:bg-yellow-600/30 border border-yellow-200 dark:border-yellow-700/30",
        success: "border-transparent bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-600/20 dark:text-green-300 dark:hover:bg-green-600/30 border border-green-200 dark:border-green-700/30",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        timerNormal: "bg-blue-100 text-blue-700 dark:bg-blue-700/20 dark:text-blue-300 border-blue-200 dark:border-blue-700/30",
        timerWarning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700/30",
        timerUrgent: "bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300 border-red-200 dark:border-red-700/30",
        red: "bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300 border-red-200 dark:border-red-700/30",
        violet: "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300 border-violet-100/50 dark:border-violet-400/20",
        indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300 border-indigo-100/50 dark:border-indigo-400/20",
        green: "bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300 border-green-200 dark:border-green-700/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
