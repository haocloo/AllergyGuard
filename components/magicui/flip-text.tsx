'use client';

import { AnimatePresence, motion, Variants } from 'motion/react';

import { cn } from '@/lib/cn';

interface FlipTextProps {
  word: string;
  duration?: number;
  delayMultiple?: number;
  framerProps?: Variants;
  className?: string;
}

export function FlipText({
  word,
  duration = 0.5,
  delayMultiple = 0.08,
  framerProps = {
    hidden: { rotateX: -90, opacity: 0 },
    visible: { rotateX: 0, opacity: 1 },
  },
  className,
}: FlipTextProps) {
  return (
    <div className="flex justify-center space-x-2">
      <AnimatePresence mode="wait">
        {word.split('').map((char, i) => (
          <motion.span
            key={i}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={framerProps}
            transition={{ duration, delay: i * delayMultiple }}
            className={cn('origin-center drop-shadow-sm', className)}
          >
            {char}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Sample
/*
import FlipText from "@/components/magicui/flip-text";

export function FlipTextDemo() {
  return (
    <FlipText
      className="text-4xl font-bold -tracking-widest text-black dark:text-white md:text-7xl md:leading-[5rem]"
      word="Flip Text"
    />
  );
}
*/
