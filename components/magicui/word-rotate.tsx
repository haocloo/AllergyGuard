'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, MotionProps } from 'motion/react';

import { cn } from '@/lib/cn';

interface WordRotateProps {
  words: string[];
  duration?: number;
  framerProps?: MotionProps;
  className?: string;
}

export function WordRotate({
  words,
  duration = 2500,
  framerProps = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  className,
}: WordRotateProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [words, duration]);

  return (
    <div className="overflow-hidden py-2">
      <AnimatePresence mode="wait">
        <motion.h1 key={words[index]} className={cn(className)} {...framerProps}>
          {words[index]}
        </motion.h1>
      </AnimatePresence>
    </div>
  );
}

// Sample
/*
import WordRotate from "@/components/magicui/word-rotate";

export function WordRotateDemo() {
  return (
    <WordRotate
      className="text-4xl font-bold text-black dark:text-white"
      words={["Word", "Rotate"]}
    />
  );
}
*/
