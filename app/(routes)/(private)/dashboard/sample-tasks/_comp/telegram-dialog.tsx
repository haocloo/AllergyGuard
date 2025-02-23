'use client';

import { useState } from 'react';

// ui
import { Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// external
import { useToast } from '@/hooks/use-toast';

// services
import { sendTelegram } from '@/services/server';
import { TelegramSchema } from '@/services/types';

export function TelegramDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const telegramData: TelegramSchema = { message };
      await sendTelegram(telegramData);

      toast({
        title: 'Success',
        variant: 'success',
        description: 'Message sent successfully!',
      });

      // Reset form
      setMessage('');
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Failed to send message',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Send to Telegram
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Telegram Message</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Message</Label>
            <Textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Message
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
