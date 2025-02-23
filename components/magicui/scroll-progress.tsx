'use client';

import { cn } from '@/lib/cn';
import { motion, useScroll, useSpring } from 'motion/react';

interface ScrollProgressProps {
  className?: string;
}

export function ScrollProgress({ className }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 50,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className={cn(
        'fixed inset-x-0 top-0 z-[1000] h-1 origin-left bg-gradient-to-r from-[#A97CF8] via-[#F38CB8] to-[#FDCC92]',
        className
      )}
      style={{
        scaleX,
      }}
    />
  );
}

// Sample
/*
import ScrollProgress from "@/components/magicui/scroll-progress";

const ScrollProgressDemo = () => {
  return (
    <div className="z-10 rounded-lg border border-gray-200 bg-white p-4">
      <ScrollProgress className="top-[65px]" />
      <h2 className="pb-4 font-bold">
        Note: The scroll progress is shown below the navbar of the page.
      </h2>
      <p className="pb-4">
        Magic UI is a collection of re-usable components that you can copy and
        paste into your web apps. It primarily features components, blocks, and
        templates geared towards creating landing pages and user-facing
        marketing materials.
      </p>
    </div>
  );
};

export ScrollProgressDemo;
*/
