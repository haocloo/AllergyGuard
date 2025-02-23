'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// external
import { experimental_useObject } from 'ai/react';
import { cn } from '@/lib/cn';
import { v4 as uuidv4 } from 'uuid';

// ui
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Send, X, AlertCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

// external services
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

// services
import { useVoiceRecognitionStore, useInterviewSessionSpeechStore } from '@/services/store';
import { AI_create_task } from './actions';
import { useAI_TaskStore } from './store';
import type { Task, T_schema_create_task } from './types';

// Schema for AI response - removed URL format validation
const taskResponseSchema = z.object({
  name: z.string(),
  category: z.enum(['work', 'personal', 'shopping', 'health', 'others']),
  primaryImage: z.string(),
  secondaryImage: z.string(),
});

export type TaskSuggestion = z.infer<typeof taskResponseSchema>;


export function AITask() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [editableText, setEditableText] = useState<string>('');
  const [aiSuggestion, setAiSuggestion] = useState<TaskSuggestion | null>(null);
  const addTask = useAI_TaskStore((state) => state.addTask);

  const { toast } = useToast();
  const { text, isListening, resetTranscript } = useVoiceRecognitionStore();
  const { handleRecording, permissionState } = useInterviewSessionSpeechStore();

  useEffect(() => {
    setEditableText(text);
  }, [text]);

  const { isLoading, error, submit } = experimental_useObject<TaskSuggestion>({
    api: '/api/genai/create-task',
    schema: taskResponseSchema,
    onFinish: (message: any) => {
      const response = message.object;
      setAiSuggestion(response);
    },
    onError: (error: Error) => {
      console.error('AI Response Error:', error);
      toast({
        title: 'AI Response Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (): void => {
    const systemPrompt = `You are an AI assistant helping users create tasks. Based on the user's description, suggest:
    1. A clear and concise task name
    2. The most appropriate category from: work, personal, shopping, health, or others
    3. Two relevant images from Unsplash that represent the task
    
    For the images, use Unsplash URLs in this format: https://images.unsplash.com/photo-[ID]
    For example: https://images.unsplash.com/photo-1542838132-92c53300491e
    
    Make the suggestions practical and actionable. The images should be visually appealing and relevant to the task context.
    Here are some example image IDs you can use:
    - Shopping: photo-1542838132-92c53300491e
    - Work: photo-1497032628192-86f99bcd76bc
    - Health: photo-1571019613454-1cb2f99b2d8b
    - Personal: photo-1484480974693-6ca0a78fb36b
    
    Return the response in this format:
    {
      "name": "Task name",
      "category": "one of the categories",
      "primaryImage": "first unsplash url with photo ID",
      "secondaryImage": "second unsplash url with photo ID"
    }`;

    const userPrompt = `Based on the following request, suggest a task: "${editableText}"`;

    submit({
      systemPrompt,
      userPrompt,
    });
  };

  const handleAcceptSuggestion = async () => {
    if (!aiSuggestion) return;

    try {
      const taskData: T_schema_create_task = {
        id: uuidv4(),
        name: aiSuggestion.name,
        category: aiSuggestion.category,
        status: 'pending' as const,
        primaryImage: { preview: aiSuggestion.primaryImage, file: undefined },
        secondaryImage: { preview: aiSuggestion.secondaryImage, file: undefined },
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: uuidv4(), // Placeholder, will be replaced by server with session user
      };

      const res = await AI_create_task(taskData);

      if (res.status === 'ERROR') {
        toast({
          title: 'Error',
          description: res.message || 'Failed to create task',
          variant: 'destructive',
        });
        return;
      }

      // Update the local store with the server-validated task
      const clientTask: Task = {
        id: taskData.id,
        name: taskData.name,
        category: taskData.category,
        status: taskData.status,
        primaryImage: taskData.primaryImage.preview,
        secondaryImage: taskData.secondaryImage.preview,
        createdAt: taskData.createdAt.toISOString(),
      };

      addTask(clientTask);

      toast({
        title: 'Success',
        description: 'Task created successfully',
        variant: 'success',
      });

      setIsOpen(false);
      resetTranscript();
      setEditableText('');
      setAiSuggestion(null);
    } catch (error) {
      console.error('Create task error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Button variant="magical" onClick={() => setIsOpen(true)} className="w-full md:w-auto">
        <Mic className="mr-2 h-4 w-4" />
        AI Task Assistant
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0">
          <div className="p-6">
            <DialogHeader className="space-y-4">
              <DialogTitle>AI Task Assistant</DialogTitle>
              <DialogDescription className="space-y-2">
                <p>Describe your task and I'll help you set it up.</p>
                <p className="font-medium">
                  Example: "Create a task for my weekly grocery shopping this weekend"
                </p>
              </DialogDescription>
            </DialogHeader>
          </div>

          <ScrollArea className="flex-1 px-6">
            <div className="space-y-4 pb-24">
              {/* Input Card */}
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Your Request</h3>
                    <Badge variant={isListening ? 'default' : 'secondary'}>
                      {isListening ? 'Recording...' : 'Not Recording'}
                    </Badge>
                  </div>
                  <Textarea
                    value={editableText}
                    onChange={(e) => setEditableText(e.target.value)}
                    placeholder="Your task description will appear here. You can edit it manually."
                    className="min-h-[100px] resize-none"
                  />
                </CardContent>
              </Card>

              {/* Loading State */}
              {isLoading && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
                      <div className="space-y-2">
                        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="aspect-video bg-muted animate-pulse rounded-lg" />
                        <div className="aspect-video bg-muted animate-pulse rounded-lg" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Suggestion Card */}
              {aiSuggestion && !isLoading && (
                <Card>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Task Name</h3>
                        <p className="text-lg font-medium">{aiSuggestion.name}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                        <Badge variant="secondary" className="mt-1 capitalize">
                          {aiSuggestion.category}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Suggested Images
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={aiSuggestion.primaryImage}
                              alt="Primary task image"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={aiSuggestion.secondaryImage}
                              alt="Secondary task image"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full" onClick={handleAcceptSuggestion}>
                      Accept and Create Task
                    </Button>
                  </CardContent>
                </Card>
              )}

              {error && (
                <div className="bg-destructive/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm font-medium">{error.message}</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Panel - Fixed at bottom */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center p-6 bg-gradient-to-t from-background via-background to-transparent">
            <div className="flex items-center gap-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-full shadow-md p-2">
              {/* Clear button */}
              {editableText && (
                <button
                  type="button"
                  onClick={() => {
                    resetTranscript();
                    setEditableText('');
                    setAiSuggestion(null);
                  }}
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              )}

              {/* Voice button */}
              <button
                type="button"
                onClick={() => handleRecording({})}
                disabled={permissionState === 'denied'}
                className={cn(
                  'relative w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                  isListening ? 'bg-blue-500 dark:bg-blue-700' : 'bg-gray-50 dark:bg-gray-700'
                )}
              >
                {isListening ? (
                  <div className="relative size-full rounded-full overflow-hidden">
                    <Image
                      src="/voice-assistant/voice-animation-start.gif"
                      width={100}
                      height={100}
                      alt="Voice recording Start"
                      className="w-full h-full object-cover rounded-full"
                      priority
                    />
                  </div>
                ) : (
                  <Image
                    src="/voice-assistant/voice-animation-stop.png"
                    width={100}
                    height={100}
                    alt="Voice recording Stop"
                    className="w-full h-full object-cover rounded-full"
                    priority
                  />
                )}
              </button>

              {/* Submit button */}
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !editableText.trim()}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white"
              >
                <Send className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
