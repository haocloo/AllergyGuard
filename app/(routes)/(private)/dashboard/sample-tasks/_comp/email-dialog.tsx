'use client';

import { useState } from 'react';

// ui
import { Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// pui
import RichTextEditor from '@/components/ui/rich-text-editor';

// external
import { useToast } from '@/hooks/use-toast';

// services
import { sendEmail } from '@/services/server';
import { EmailSchema } from '@/services/types';

export function EmailDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const emailData: EmailSchema = {
        to,
        subject,
        html: content,
      };

      await sendEmail(emailData);

      toast({
        title: 'Success',
        variant: 'success',
        description: 'Email sent successfully!',
      });

      // Reset form
      setTo('');
      setSubject('');
      setContent('');
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Failed to send email',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Mail className="h-4 w-4" />
          Send Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>
          <div className="grid gap-2">
            <Label>Content</Label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
