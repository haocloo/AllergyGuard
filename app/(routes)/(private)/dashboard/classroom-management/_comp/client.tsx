'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useClassroomStore } from './store';
import { AddClassroomDialog } from './add-classroom-dialog';
import type { Classroom } from '@/services/dummy-data';

interface ClassroomClientProps {
  initialClassrooms: Classroom[];
}

export default function ClassroomClient({ initialClassrooms }: ClassroomClientProps) {
  const { classrooms, setClassrooms, isLoading, setDialogOpen } = useClassroomStore();

  useEffect(() => {
    setClassrooms(initialClassrooms);
  }, [initialClassrooms, setClassrooms]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Classroom
        </Button>
      </div>

      <AnimatePresence>
        {classrooms.map((classroom) => (
          <motion.div
            key={classroom.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold">
                  Classroom {classroom.code}
                </h3>
                <p className="text-sm text-gray-500">
                  Teacher: {classroom.teacher.name}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {isLoading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      )}

      <AddClassroomDialog />
    </div>
  );
}