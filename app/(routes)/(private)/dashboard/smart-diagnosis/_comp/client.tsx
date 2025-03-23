'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Components
import {
  Phone,
  Loader2,
  Search,
  Brain,
  AlertTriangle,
  X,
  Zap,
  Sparkles,
  Globe,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSteps } from './loading-steps';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Services
import type { TDiagnosis } from '@/services/dummy-data';
import {
  useVoiceRecognitionStore,
  useInterviewSessionSpeechStore,
  SPEECH_RECOGNITION_LANGUAGES,
} from '@/services/store';
import { useDiagnosisStore, EnhancedDiagnosis } from './store';
import { get_diagnosis, DiagnosisResult } from './action';
import { children } from '@/services/dummy-data';

interface SmartDiagnosisClientProps {
  initialDiagnoses: TDiagnosis[];
  initialChildren: {
    id: string;
    name: string;
    photoUrl: string;
    allergies: string[];
  }[];
}

// Helper function to get color based on percentage match
const getMatchColor = (percentage: number) => {
  if (percentage >= 80) return 'bg-green-100 text-green-800';
  if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
  return 'bg-orange-100 text-orange-800';
};

// Helper function to get language emoji based on language code
const getLanguageEmoji = (languageCode: string): string => {
  switch (languageCode) {
    case 'en-US':
      return '🇺🇸';
    case 'zh-CN':
      return '🇨🇳';
    case 'ms-MY':
      return '🇲🇾';
    case 'ta-IN':
      return '🇮🇳';
    default:
      return '🌐';
  }
};

export function SmartDiagnosisClient({
  initialDiagnoses,
  initialChildren,
}: SmartDiagnosisClientProps) {
  const [input, setInput] = useState('');
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const { text, isListening, resetTranscript, selectedLanguage, setSelectedLanguage } =
    useVoiceRecognitionStore();
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

    // Validate if user is selected
    if (!selectedUser) {
      toast({
        title: 'User selection required',
        description: 'Please select a child before proceeding with diagnosis',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      // validation
      const searchText = input;
      if (!searchText.trim()) return;

      setHasSearched(true);
      setSelectedDiagnosis(null);

      const diagnosisResults = await get_diagnosis();

      // Map the diagnosis results to enhanced diagnoses with percentage match and reason
      const enhancedDiagnoses: EnhancedDiagnosis[] = diagnosisResults
        .map((result) => {
          const diagnosis = initialDiagnoses.find((d) => d.id === result.id);
          if (!diagnosis) return null;

          return {
            ...diagnosis,
            percentageMatch: result.percentageMatch,
            reason: result.reason,
          };
        })
        .filter(Boolean) as EnhancedDiagnosis[];

      setFilteredDiagnoses(enhancedDiagnoses);
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
    // Stop listening if active
    if (isListening) {
      const recognition = (window as any).__recognition;
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
        delete (window as any).__recognition;
      }
      useVoiceRecognitionStore.getState().setIsListening(false);
    }

    // Clear the input and text, but keep the selected language
    setInput('');
    useVoiceRecognitionStore.getState().setText('');
    useVoiceRecognitionStore.getState().setTempText('');

    // Reset diagnosis state
    setSelectedDiagnosis(null);
    setFilteredDiagnoses(initialDiagnoses.slice(0, 3));
    setHasSearched(false);
    setSelectedUser(null); // Reset selected user

    toast({
      title: 'Input cleared',
      description: 'Ready for new symptoms description',
      duration: 2000,
    });
  };

  // Handle language change
  const handleLanguageChange = (value: string) => {
    // Don't do anything if the language is already selected
    if (value === selectedLanguage) return;

    // Stop listening if currently active but preserve the text
    if (isListening) {
      const recognition = (window as any).__recognition;
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {
          console.error('Error stopping recognition during language change:', e);
        }
        delete (window as any).__recognition;
      }
      // Only update the listening state, don't clear text
      useVoiceRecognitionStore.getState().setIsListening(false);
    }

    // Set changing language state to show indicator
    setIsChangingLanguage(true);

    // Set the new language
    setSelectedLanguage(value);

    // Show toast notification
    const languageName = SPEECH_RECOGNITION_LANGUAGES.find((lang) => lang.code === value)?.name;
    toast({
      title: `Language changed to ${languageName}`,
      description: 'Voice recognition will now detect this language',
      duration: 3000,
    });

    // Clear changing language state after a delay
    setTimeout(() => {
      setIsChangingLanguage(false);
    }, 1000);
  };

  const handleRecordingBtn = () => {
    try {
      // If already listening, just stop
      if (isListening) {
        const recognition = (window as any).__recognition;
        if (recognition) {
          try {
            recognition.stop();
          } catch (e) {
            console.error('Error stopping recognition:', e);
          }
          delete (window as any).__recognition;
        }
        useVoiceRecognitionStore.getState().setIsListening(false);

        // No need for a toast notification for stopping - the color change is enough
      } else {
        // Start listening
        handleRecording({});

        // No need for a toast notification for starting - the color change is enough
      }
    } catch (error) {
      console.error('Error in recording toggle:', error);
      // Force reset the recognition state
      const recognition = (window as any).__recognition;
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {}
        delete (window as any).__recognition;
      }
      useVoiceRecognitionStore.getState().setIsListening(false);

      toast({
        title: 'Recording error',
        description: 'There was an error with the speech recognition. Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full px-1 sm:px-4 max-w-3xl mx-auto pb-20">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center w-full">
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

      {/* User Selection Card */}
      <Card className="border-primary/20 overflow-hidden">
        <div className="bg-primary/5 px-4 py-3 border-b border-primary/10">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Select Child
          </h2>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Select a user to provide personalized diagnosis based on their medical history:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {initialChildren.map((user) => {
              return (
                <Card
                  key={user.id}
                  className={cn(
                    `p-3 cursor-pointer transition-all hover:bg-primary/5`,
                    selectedUser === user.id ? 'ring-2 ring-primary bg-primary/5' : ''
                  )}
                  onClick={() => setSelectedUser(user.id)}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      {user.photoUrl ? (
                        <Image
                          src={user.photoUrl}
                          alt={user.name}
                          width={64}
                          height={64}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-primary" />
                      )}
                    </div>
                    <h3 className="font-medium">{user.name}</h3>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {user.allergies.map((allergy, index) => (
                        <Badge key={index} variant="darkRed" className="text-xs">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {selectedUser && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUser(null)}
                className="text-sm"
              >
                Clear Selection
              </Button>
            </div>
          )}
        </div>
      </Card>

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

            {/* Voice recognition control - redesigned */}
            <div className="flex">
              {/* Recording button */}
              <button
                type="button"
                onClick={handleRecordingBtn}
                aria-label={isListening ? 'Stop recording' : 'Start recording'}
                disabled={permissionState === 'denied' || isLoading}
                className={cn(
                  'relative z-10 h-12 px-4 flex items-center justify-center rounded-l-full border transition-colors',
                  isListening
                    ? 'bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200'
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700'
                )}
              >
                {isListening ? (
                  <div className="relative  size-8 rounded-full overflow-hidden">
                    <Image
                      src="/voice-assistant/voice-animation-start.gif"
                      width={24}
                      height={24}
                      alt="Voice recording Start"
                      className="w-full h-full object-cover rounded-full"
                      priority
                    />
                  </div>
                ) : (
                  <div className="relative size-8 rounded-full overflow-hidden">
                    <Image
                      src="/voice-assistant/voice-animation-stop.png"
                      width={24}
                      height={24}
                      alt="Voice recording Stop"
                      className="w-full h-full  object-cover rounded-full"
                      priority
                    />
                  </div>
                )}
              </button>

              {/* Language dropdown */}
              <Select
                value={selectedLanguage}
                onValueChange={handleLanguageChange}
                disabled={isLoading}
              >
                <SelectTrigger
                  className={cn(
                    'relative z-10 h-12 min-w-28 rounded-r-full border border-l-0 transition-colors',
                    isChangingLanguage ? 'bg-blue-50' : '',
                    'bg-gray-50 hover:bg-gray-100 border-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700'
                  )}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-base">{getLanguageEmoji(selectedLanguage)}</span>
                    <span className="text-sm font-medium hidden sm:inline">
                      {
                        SPEECH_RECOGNITION_LANGUAGES.find((lang) => lang.code === selectedLanguage)
                          ?.name
                      }
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent align="end">
                  {SPEECH_RECOGNITION_LANGUAGES.map((language) => (
                    <SelectItem
                      key={language.code}
                      value={language.code}
                      className={selectedLanguage === language.code ? 'bg-primary/10' : ''}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{getLanguageEmoji(language.code)}</span>
                        <span>{language.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                  {filteredDiagnoses.map((diagnosis: EnhancedDiagnosis) => (
                    <Card
                      key={diagnosis.id}
                      className={cn(
                        `p-3 cursor-pointer transition-all`,
                        selectedDiagnosis?.id === diagnosis.id ? 'ring-2 ring-primary' : ''
                      )}
                      onClick={() => setSelectedDiagnosis(diagnosis)}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{diagnosis.name}</h3>
                        {diagnosis.percentageMatch && (
                          <Badge className={cn('ml-2', getMatchColor(diagnosis.percentageMatch))}>
                            {diagnosis.percentageMatch}% Match
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {diagnosis.symptoms.slice(0, 3).map((symptom, idx) => (
                          <Badge key={idx} variant="violet" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                        {diagnosis.symptoms.length > 3 && (
                          <Badge variant="violet" className="text-xs">
                            +{diagnosis.symptoms.length - 3} more
                          </Badge>
                        )}
                      </div>
                      {/* Diagnosis reasoning - now shown in the card */}
                      {diagnosis.reason && (
                        <div className="mt-3 p-2 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                          <div className="flex items-start gap-2">
                            <Sparkles className="h-5 w-5 shrink-0" />
                            <p className="text-sm text-pretty">{diagnosis.reason}</p>
                          </div>
                        </div>
                      )}
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
                {'percentageMatch' in selectedDiagnosis && selectedDiagnosis.percentageMatch && (
                  <Badge className={cn('mt-2', getMatchColor(selectedDiagnosis.percentageMatch))}>
                    {selectedDiagnosis.percentageMatch}% Match
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <p className="text-muted-foreground">{selectedDiagnosis.description}</p>

                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Common Symptoms:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDiagnosis.symptoms.map((symptom, idx) => (
                      <Badge key={idx} variant="violet">
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
