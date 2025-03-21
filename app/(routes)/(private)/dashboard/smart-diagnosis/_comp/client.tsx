'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Components
import { Phone, Loader2, Search, Brain, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSteps } from './loading-steps';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';

// Services
import type { TDiagnosis } from '@/services/dummy-data';
import { useVoiceRecognitionStore, useInterviewSessionSpeechStore } from '@/services/store';
import { useDiagnosisStore } from './store';
import { get_diagnosis } from './action';

interface SmartDiagnosisClientProps {
  initialDiagnoses: TDiagnosis[];
}

export function SmartDiagnosisClient({ initialDiagnoses }: SmartDiagnosisClientProps) {
  const [input, setInput] = useState('');
  const { text, isListening, resetTranscript } = useVoiceRecognitionStore();
  const { handleRecording, permissionState } = useInterviewSessionSpeechStore();
  const { toast } = useToast();

  const {
    selectedDiagnosis,
    setSelectedDiagnosis,
    isLoading,
    setIsLoading,
    filteredDiagnoses,
    setFilteredDiagnoses,
    hasSearched,
    setHasSearched,
  } = useDiagnosisStore();

  // Update input field when speech recognition detects text
  useEffect(() => {
    setInput(text);
  }, [text]);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // validation
      const searchText = input;
      if (!searchText.trim()) return;

      setHasSearched(true);
      setSelectedDiagnosis(null);

      const result = await get_diagnosis();

      const filteredResults = initialDiagnoses.filter((diagnosis) => result.includes(diagnosis.id));

      setFilteredDiagnoses(filteredResults);
      setIsLoading(false);
    } catch (error) {
      toast({
        title: 'Error searching for diagnoses',
        description: 'Please try again later',
        variant: 'destructive',
        duration: 3000,
      });
      console.error('Error searching for diagnoses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to start over
  const handleReset = () => {
    setInput('');
    resetTranscript();
    setSelectedDiagnosis(null);
    setFilteredDiagnoses(initialDiagnoses.slice(0, 3));
    setHasSearched(false);
  };

  return (
    <div className="flex flex-col gap-6 w-full px-1 sm:px-4 max-w-3xl mx-auto pb-20">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary">Smart Medical Diagnosis</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Get quick medical guidance for emergency situations
            </p>
          </div>
          {selectedDiagnosis && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              Start Over
            </Button>
          )}
        </div>
      </div>

      {/* Step 1: Symptom Input */}
      <Card className="border-primary/20 overflow-hidden">
        <div className="bg-primary/5 px-4 py-3 border-b border-primary/10">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Describe Symptoms
          </h2>
        </div>
        <form onSubmit={handleSearch} className="p-4 space-y-4">
          <Textarea
            placeholder="Describe the symptoms in detail (e.g., 'Severe facial swelling, difficulty breathing, rash after eating peanuts')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-32 text-base"
          />

          <div className="flex items-center gap-4 justify-end">
            {/* Clear button */}
            {input && (
              <button
                type="button"
                onClick={handleReset}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white"
              >
                <X className="w-6 h-6" />
              </button>
            )}

            {/* Voice button */}
            <button
              type="button"
              onClick={() => handleRecording({})}
              disabled={permissionState === 'denied' || isLoading}
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
              variant="default"
              className="flex items-center gap-2 px-4 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white"
              type="submit"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              Diagnose
            </Button>
          </div>
        </form>
      </Card>

      {/* Loading Indicator with Animated Thinking Steps */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full"
          >
            <Card className="border-primary/20 overflow-hidden">
              <div className="p-6">
                <div className="relative flex h-[300px] w-full flex-col overflow-hidden">
                  <LoadingSteps />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background"></div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 2: Diagnosis Selection */}
      <AnimatePresence>
        {!isLoading && filteredDiagnoses.length > 0 && input.trim() && hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-primary/20 overflow-hidden">
              <div className="bg-primary/5 px-4 py-3 border-b border-primary/10">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Possible Diagnoses
                </h2>
              </div>
              <div className="p-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Based on the symptoms described, these are the most likely conditions:
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {filteredDiagnoses.map((diagnosis) => (
                    <Card
                      key={diagnosis.id}
                      className={`p-3 cursor-pointer hover:border-primary transition-all ${
                        selectedDiagnosis?.id === diagnosis.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedDiagnosis(diagnosis)}
                    >
                      <h3 className="font-medium">{diagnosis.name}</h3>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {diagnosis.symptoms.slice(0, 3).map((symptom, idx) => (
                          <Badge key={idx} variant="indigo" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                        {diagnosis.symptoms.length > 3 && (
                          <Badge variant="indigo" className="text-xs">
                            +{diagnosis.symptoms.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 3: Diagnosis Details */}
      <AnimatePresence>
        {selectedDiagnosis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Diagnosis Name and Description */}
            <Card className="border-primary/20 overflow-hidden">
              <div className="bg-primary/5 px-4 py-3 border-b border-primary/10">
                <Badge variant="default" className="mb-2">
                  Diagnosis
                </Badge>
                <h2 className="text-xl font-bold">{selectedDiagnosis.name}</h2>
              </div>
              <div className="p-4">
                <p className="text-muted-foreground">{selectedDiagnosis.description}</p>

                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Common Symptoms:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDiagnosis.symptoms.map((symptom, idx) => (
                      <Badge key={idx} variant="outline">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Recommended Actions */}
            <Card className="border-primary/20 overflow-hidden">
              <div className="bg-primary/5 px-4 py-3 border-b border-primary/10">
                <h3 className="text-lg font-medium">Recommended Actions</h3>
              </div>
              <div className="p-4">
                <ol className="list-decimal list-inside space-y-3">
                  {selectedDiagnosis.recommendedActions.map((action, index) => (
                    <li key={index} className="text-gray-700">
                      {action}
                    </li>
                  ))}
                </ol>

                {/* Action Visualization */}
                {selectedDiagnosis.recommendedActionImage && (
                  <div className="mt-6 flex justify-center">
                    <div className="relative w-full max-w-[400px] rounded-lg overflow-hidden border">
                      <Badge variant="secondary" className="absolute top-2 right-2 z-10">
                        Visual Guide
                      </Badge>
                      <img
                        src={selectedDiagnosis.recommendedActionImage}
                        alt="Recommended Action Visualization"
                        className="w-full h-auto rounded-lg object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Follow-ups */}
            <Card className="border-primary/20 overflow-hidden">
              <div className="bg-primary/5 px-4 py-3 border-b border-primary/10">
                <h3 className="text-lg font-medium">Follow-up Protocol</h3>
              </div>
              <div className="p-4">
                <ol className="list-decimal list-inside space-y-3">
                  {selectedDiagnosis.followUps.map((followUp, index) => (
                    <li key={index} className="text-gray-700">
                      {followUp}
                    </li>
                  ))}
                </ol>
              </div>
            </Card>

            {/* Emergency Call */}
            <Card className="border-destructive/20 overflow-hidden">
              <div className="bg-destructive/5 px-4 py-3 border-b border-destructive/10">
                <h3 className="text-lg font-medium text-destructive">Emergency Contact</h3>
              </div>
              <div className="p-4 space-y-4">
                <Button variant="destructive" className="gap-2 w-full sm:w-auto">
                  <Phone className="h-4 w-4" />
                  Call Emergency Services (999)
                </Button>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">What to say:</h4>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>There is a person having {selectedDiagnosis.name}</li>
                    <li>They are experiencing symptoms such as _______</li>
                    <li>They are allergic to [allergens if known]</li>
                    <li>Our location is at Klinik Kesihatan KKM Pulau Pinang</li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results Message */}
      <AnimatePresence>
        {!isLoading && input.trim() && filteredDiagnoses.length === 0 && hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            <Card className="p-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <AlertTriangle className="h-10 w-10  text-orange-600" />
                <div>
                  <h3 className="font-medium">No matching diagnoses found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try describing the symptoms differently or with more details
                  </p>
                </div>
                <Button variant="warning" className="mt-2" onClick={handleReset}>
                  Start Over
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
