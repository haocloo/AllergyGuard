'use client';

import { useState } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Bug } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generate_student_sample_logs, generate_educator_sample_logs } from './actions';
import { v4 as uuidv4 } from 'uuid';

export function DebugLogger() {
  const [isLogging, setIsLogging] = useState(false);
  const { toast } = useToast();

  const triggerLogs = async () => {
    setIsLogging(true);
    try {
      // Generate both student and educator logs 3 times each
      const promises = [
        ...Array(3)
          .fill(null)
          .map(() => generate_student_sample_logs(uuidv4())),
        ...Array(3)
          .fill(null)
          .map(() => generate_educator_sample_logs(uuidv4())),
      ];

      const results = await Promise.allSettled(promises);

      // Check if all promises were fulfilled successfully
      const allSuccessful = results.every(
        (result) => result.status === 'fulfilled' && result.value.success
      );

      if (allSuccessful) {
        toast({
          title: 'Success',
          description: 'All sample logs generated successfully',
          variant: 'success',
        });
      } else {
        const fulfilledCount = results.filter(
          (result) => result.status === 'fulfilled' && result.value.success
        ).length;

        toast({
          title: 'Partial Success',
          description: `${fulfilledCount} out of ${promises.length} log generations completed successfully`,
          variant: 'pending',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate sample logs',
        variant: 'destructive',
      });
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <Button
      onClick={triggerLogs}
      disabled={isLogging}
      className="gap-2"
      variant="outline"
      size="default"
    >
      <Bug className="h-4 w-4" />
      {isLogging ? 'Generating Sample Logs...' : 'Generate Sample Logs'}
    </Button>
  );
}
