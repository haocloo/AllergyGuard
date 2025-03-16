'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { experimental_useObject } from 'ai/react';
import Image from 'next/image';
import { cn } from '@/lib/cn';

// ui
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, Send, X, AlertCircle, Search } from 'lucide-react';
import MultiSelect from '@/components/ui/multi-select';

// external services
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

// services
import { useVoiceRecognitionStore, useInterviewSessionSpeechStore } from '@/services/store';
import { usePanicModeStore } from './store';
import { analyze_symptoms } from './actions';
import { CHILD_AGES, COMMON_ALLERGIES, SUPPORTED_LANGUAGES } from './types';
import { symptomAnalysisResponseSchema } from './validation';

export type SymptomAnalysisResponse = z.infer<typeof symptomAnalysisResponseSchema>;

export function SymptomAnalyzer() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const { toast } = useToast();

  // Voice recognition
  const { text, isListening, resetTranscript } = useVoiceRecognitionStore();
  const { handleRecording, permissionState } = useInterviewSessionSpeechStore();

  // Form state
  const [formData, setFormData] = useState({
    symptoms: '',
    childAge: '',
    childAllergies: [] as string[],
    language: 'en',
  });

  // Store state
  const { setCurrentResponse, addToHistory, formState, setFormState } = usePanicModeStore();

  // Update textarea when speech recognition updates
  useEffect(() => {
    setFormData((prev) => ({ ...prev, symptoms: text }));
  }, [text]);

  // Reset form on dialog close
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      symptoms: '',
      childAge: '',
      childAllergies: [],
      language: 'en',
    });
    resetTranscript();
    setIsPending(false);
  };

  const setField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // AI analysis integration
  const { isLoading, error, submit } = experimental_useObject<SymptomAnalysisResponse>({
    api: '/api/genai/analyze-symptoms',
    schema: symptomAnalysisResponseSchema,
    onFinish: (message: any) => {
      setIsPending(false);

      // Create response object
      const symptomResponse = {
        requestId: uuidv4(),
        timestamp: new Date().toISOString(),
        symptoms: formData.symptoms,
        possibleCauses: message.object.potentialCauses.map((cause: any) => ({
          condition: cause.name,
          description: cause.description,
          urgencyLevel: cause.urgencyLevel,
        })),
        recommendedActions: message.object.potentialCauses.flatMap((cause: any) =>
          cause.recommendedActions.map((action: string) => ({
            action,
            urgency:
              cause.urgencyLevel === 'emergency'
                ? 'immediate'
                : cause.urgencyLevel === 'high'
                ? 'soon'
                : 'when convenient',
            instructions: action,
          }))
        ),
        allergyRelated: message.object.potentialCauses.some(
          (cause: any) =>
            cause.name.toLowerCase().includes('allerg') ||
            cause.description.toLowerCase().includes('allerg')
        ),
        additionalNotes:
          'This analysis is based on the provided symptoms and is not a medical diagnosis.',
        sourceReferences: [],
        createdAt: new Date().toISOString(),
      };

      // Update store with response
      setCurrentResponse(symptomResponse);

      // Add to history
      addToHistory({
        id: uuidv4(),
        userId: 'current-user', // Will be replaced in the server action
        symptomResponse,
      });

      // Close dialog
      setIsOpen(false);
    },
    onError: (err: Error) => {
      console.error('AI Response Error:', err);
      toast({
        title: 'Analysis Error',
        description: err.message,
        variant: 'destructive',
      });
      setIsPending(false);
    },
  });

  const handleSubmit = () => {
    if (!formData.symptoms.trim()) {
      toast({
        title: 'Input required',
        description: 'Please enter the symptoms to analyze.',
        variant: 'destructive',
      });
      return;
    }

    setIsPending(true);

    const systemPrompt = `You are a pediatric medical assistant helping caregivers identify potential causes of children's symptoms.
    
    Your role is to:
    1. Analyze the symptoms described by the caregiver
    2. Identify potential causes with appropriate urgency levels
    3. Provide recommended actions for each potential cause
    
    Based on the symptoms, provide 1-3 potential causes, with:
    - A clear name for the condition
    - A brief description
    - An urgency level (low, medium, high, or emergency)
    - 3-5 recommended actions

    IMPORTANT: For any potentially life-threatening conditions (difficulty breathing, severe allergic reactions, etc.), 
    ALWAYS classify as "emergency" and recommend seeking immediate medical attention.
    
    Return ONLY a JSON response in this format:
    {
      "potentialCauses": [
        {
          "name": "Condition Name",
          "description": "Brief description of the condition",
          "urgencyLevel": "low|medium|high|emergency",
          "recommendedActions": ["Action 1", "Action 2", "Action 3"]
        }
      ]
    }
    
    Remember that this is for informational purposes only and not a substitute for professional medical advice.`;

    submit({
      symptoms: formData.symptoms,
      childAge: formData.childAge,
      childAllergies: formData.childAllergies,
      language: formData.language,
      systemPrompt: systemPrompt,
    });
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="default" className="w-full">
        <Search className="mr-2 h-4 w-4" />
        New Symptom Analysis
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] flex flex-col p-0">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle>Symptom Analysis</DialogTitle>
              <DialogDescription>
                Describe the symptoms in detail to get potential causes and recommended actions.
              </DialogDescription>
            </DialogHeader>
          </div>

          <ScrollArea className="flex-1 px-6">
            <div className="grid gap-4 pb-24">
              {formState.status === 'ERROR' && (
                <div className="bg-destructive/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm font-medium">{formState.message}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setField('language', value)}
                    disabled={isPending || isLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="childAge">Child's Age (Optional)</Label>
                  <Select
                    value={formData.childAge}
                    onValueChange={(value) => setField('childAge', value)}
                    disabled={isPending || isLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not specified</SelectItem>
                      {CHILD_AGES.map((age) => (
                        <SelectItem key={age.value} value={age.value}>
                          {age.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="childAllergies">Known Allergies (Optional)</Label>
                  <MultiSelect
                    options={COMMON_ALLERGIES}
                    value={formData.childAllergies.map(
                      (allergyValue) =>
                        COMMON_ALLERGIES.find((a) => a.value === allergyValue) || {
                          value: allergyValue,
                          label: allergyValue,
                        }
                    )}
                    onChange={(selected) =>
                      setField(
                        'childAllergies',
                        selected.map((option) => option.value)
                      )
                    }
                    placeholder="Select allergies"
                    disabled={isPending || isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="symptoms">Symptoms</Label>
                    <Badge variant={isListening ? 'default' : 'secondary'}>
                      {isListening ? 'Recording...' : 'Not Recording'}
                    </Badge>
                  </div>
                  <Textarea
                    id="symptoms"
                    value={formData.symptoms}
                    onChange={(e) => setField('symptoms', e.target.value)}
                    placeholder="Describe the symptoms in detail..."
                    className="min-h-[120px] resize-none"
                    disabled={isPending || isLoading}
                  />
                </div>

                {error && (
                  <div className="bg-destructive/50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5" />
                      <p className="text-sm font-medium">{error.message}</p>
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="space-y-4">
                    <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Input Panel - Fixed at bottom */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center p-6 bg-gradient-to-t from-background via-background to-transparent">
            <div className="flex items-center gap-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-full shadow-md p-2">
              {/* Clear button */}
              {formData.symptoms && (
                <button
                  type="button"
                  onClick={() => {
                    resetTranscript();
                    setField('symptoms', '');
                  }}
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white"
                  disabled={isPending || isLoading}
                >
                  <X className="w-6 h-6" />
                </button>
              )}

              {/* Voice button */}
              <button
                type="button"
                onClick={() => handleRecording({})}
                disabled={permissionState === 'denied' || isPending || isLoading}
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
                disabled={isLoading || isPending || !formData.symptoms.trim()}
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
