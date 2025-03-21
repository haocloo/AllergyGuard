'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useClassroomStore } from './store';

export function AddClassroomDialog() {
  const { isDialogOpen, setDialogOpen, addClassroom, isLoading } = useClassroomStore();
  const [code, setCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    await addClassroom(code);
    setCode('');
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add your child to classroom</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter classroom code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !code.trim()}>
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Joining...
                </>
              ) : (
                'Join'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}