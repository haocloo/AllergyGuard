'use client';

import { useEffect } from 'react';

// ui
import { SymptomAnalyzer } from './symptom-analyzer';
import { SymptomHistory } from './symptom-history';
import { AnalysisResults } from './analysis-results';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

// services
import { usePanicModeStore } from './store';
import type { SymptomHistory as SymptomHistoryType } from './types';

interface Props {
  initialSymptomHistory: SymptomHistoryType[];
}

export function PanicModeClient({ initialSymptomHistory }: Props) {
  const { setSymptomHistory, currentResponse, clearCurrentResponse } = usePanicModeStore();

  // Initialize symptom history
  useEffect(() => {
    setSymptomHistory(initialSymptomHistory);
  }, [initialSymptomHistory, setSymptomHistory]);

  return (
    <div className="space-y-6">
      {/* Header Section - Made responsive for small screens */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Emergency Support - Panic Mode
          </h1>
          <p className="text-sm text-muted-foreground">
            Describe symptoms for quick assessment and guidance
          </p>
        </div>
      </div>

      {/* Emergency Notice */}
      <Alert
        variant="destructive"
        className="bg-destructive/10 text-destructive border-destructive/50"
      >
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Emergency Notice</AlertTitle>
        <AlertDescription>
          If you are experiencing a medical emergency, please call emergency services immediately.
          This tool is not a substitute for professional medical advice.
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Column - Symptom Analyzer & History Button */}
        <div className="md:col-span-6 lg:col-span-5 space-y-4">
          <SymptomAnalyzer />
          <SymptomHistory />
        </div>

        {/* Right Column - Results Section */}
        <div className="md:col-span-6 lg:col-span-7">
          {currentResponse ? (
            <AnalysisResults result={currentResponse} onClose={clearCurrentResponse} />
          ) : (
            <div className="border rounded-lg p-6 flex flex-col items-center justify-center min-h-[300px] bg-muted/50">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">No Active Analysis</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Describe your child's symptoms via text or voice in the analyzer panel. Our AI
                  will analyze them and provide possible causes and recommended actions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
