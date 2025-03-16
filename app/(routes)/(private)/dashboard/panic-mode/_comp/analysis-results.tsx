'use client';

import { useState } from 'react';
import { SymptomResponse } from './types';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ui
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  X,
  AlertOctagon,
  CheckCircle2,
  Share2,
  Printer,
  Clipboard,
  Volume2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useInterviewSessionSpeechStore } from '@/services/store';
import { cn } from '@/lib/cn';

interface AnalysisResultsProps {
  result: SymptomResponse;
  onClose: () => void;
}

// Function to format date for display
const formatDate = (dateString: string): string => {
  return format(new Date(dateString), 'PPP p'); // e.g., "Apr 29, 2023, 3:30 PM"
};

export function AnalysisResults({ result, onClose }: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState('causes');
  const { toast } = useToast();
  const { speakText } = useInterviewSessionSpeechStore();

  // Function to determine badge color based on urgency level
  const getUrgencyBadgeClass = (level: string) => {
    switch (level) {
      case 'emergency':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    }
  };

  // Function to get urgency icon
  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case 'emergency':
        return <AlertOctagon className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'low':
        return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
      default:
        return <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  // Check if there are any emergency causes
  const hasEmergency = result.possibleCauses.some((cause) => cause.urgencyLevel === 'emergency');

  // Format a summary text for speech synthesis
  const getSummaryText = () => {
    let text = `Analysis of symptoms: ${result.symptoms}. `;

    // Add causes with urgency levels
    text += 'Possible causes include: ';
    result.possibleCauses.forEach((cause, index) => {
      text += `${cause.condition}, which is a ${cause.urgencyLevel} urgency level. `;
      if (cause.urgencyLevel === 'emergency') {
        text += 'This requires immediate medical attention. ';
      }
    });

    // Add recommended actions
    text += 'Recommended actions: ';
    const immediateActions = result.recommendedActions
      .filter((action) => action.urgency === 'immediate')
      .map((action) => action.action);

    if (immediateActions.length > 0) {
      text += 'Immediate actions needed: ' + immediateActions.join('. ') + '. ';
    }

    return text;
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    const textToCopy = `
SYMPTOM ANALYSIS RESULTS
------------------------
Symptoms: ${result.symptoms}
Date: ${formatDate(result.createdAt)}

POSSIBLE CAUSES:
${result.possibleCauses
  .map(
    (cause) => `- ${cause.condition} (${cause.urgencyLevel.toUpperCase()})\n  ${cause.description}`
  )
  .join('\n\n')}

RECOMMENDED ACTIONS:
${result.recommendedActions.map((action) => `- ${action.action} (${action.urgency})`).join('\n')}

ADDITIONAL NOTES:
${result.additionalNotes}

DISCLAIMER: This analysis is for informational purposes only and not a substitute for professional medical advice.
`;

    navigator.clipboard.writeText(textToCopy).then(
      () => {
        toast({
          title: 'Copied to clipboard',
          description: 'Analysis results have been copied to your clipboard',
          variant: 'default',
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: 'Failed to copy',
          description: 'There was an error copying to clipboard',
          variant: 'destructive',
        });
      }
    );
  };

  // Print results
  const printResults = () => {
    const printContent = document.getElementById('analysis-results')?.innerHTML;
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Symptom Analysis Results</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .card { border: 1px solid #ccc; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
                .header { border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 16px; }
                .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
                .emergency { background-color: #fee2e2; color: #b91c1c; }
                .high { background-color: #ffedd5; color: #c2410c; }
                .medium { background-color: #fef3c7; color: #b45309; }
                .low { background-color: #d1fae5; color: #047857; }
                .action-item { margin-bottom: 8px; }
                .disclaimer { font-style: italic; margin-top: 24px; font-size: 12px; }
              </style>
            </head>
            <body>
              <h1>Symptom Analysis Results</h1>
              <p><strong>Symptoms:</strong> ${result.symptoms}</p>
              <p><strong>Date:</strong> ${formatDate(result.createdAt)}</p>
              
              <div class="card">
                <div class="header">
                  <h2>Possible Causes</h2>
                </div>
                ${result.possibleCauses
                  .map(
                    (cause) => `
                  <div style="margin-bottom: 16px;">
                    <h3>${cause.condition} 
                      <span class="badge ${
                        cause.urgencyLevel
                      }">${cause.urgencyLevel.toUpperCase()}</span>
                    </h3>
                    <p>${cause.description}</p>
                  </div>
                `
                  )
                  .join('')}
              </div>
              
              <div class="card">
                <div class="header">
                  <h2>Recommended Actions</h2>
                </div>
                ${result.recommendedActions
                  .map(
                    (action) => `
                  <div class="action-item">
                    <p><strong>${action.action}</strong> (${action.urgency})</p>
                  </div>
                `
                  )
                  .join('')}
              </div>
              
              ${
                result.additionalNotes
                  ? `
              <div class="card">
                <div class="header">
                  <h2>Additional Notes</h2>
                </div>
                <p>${result.additionalNotes}</p>
              </div>
              `
                  : ''
              }
              
              <p class="disclaimer">DISCLAIMER: This analysis is for informational purposes only and not a substitute for professional medical advice.</p>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  return (
    <div
      id="analysis-results"
      className="border rounded-lg overflow-hidden bg-white dark:bg-gray-950"
    >
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          {hasEmergency ? (
            <AlertOctagon className="h-5 w-5 text-destructive" />
          ) : (
            <AlertCircle className="h-5 w-5 text-blue-500" />
          )}
          <h3 className="font-medium">Symptom Analysis Results</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => speakText(getSummaryText())}>
            <Volume2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={copyToClipboard}>
            <Clipboard className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={printResults}>
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 border-b bg-muted/30">
        <div className="space-y-2">
          <div>
            <span className="text-sm text-muted-foreground">Symptoms:</span>
            <p className="font-medium">{result.symptoms}</p>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Analyzed on {formatDate(result.createdAt)}
            </span>
            {result.allergyRelated && (
              <Badge
                variant="outline"
                className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
              >
                Allergy Related
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Banner */}
      {hasEmergency && (
        <div className="p-4 bg-destructive/10 border-b border-destructive/20 flex items-center gap-3">
          <AlertOctagon className="h-5 w-5 text-destructive flex-shrink-0" />
          <p className="text-sm font-medium text-destructive">
            This analysis identified potential emergency conditions requiring immediate medical
            attention.
          </p>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="causes" value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4">
            <TabsTrigger value="causes" className="rounded-none data-[state=active]:border-b-2">
              Possible Causes
            </TabsTrigger>
            <TabsTrigger value="actions" className="rounded-none data-[state=active]:border-b-2">
              Recommended Actions
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="h-[calc(100vh-480px)] min-h-[300px]">
          <TabsContent value="causes" className="m-0 p-0">
            <div className="divide-y">
              {result.possibleCauses.map((cause, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium flex items-center gap-2">
                      {getUrgencyIcon(cause.urgencyLevel)}
                      {cause.condition}
                    </h3>
                    <Badge className={cn(getUrgencyBadgeClass(cause.urgencyLevel))}>
                      {cause.urgencyLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{cause.description}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="actions" className="m-0 p-0">
            <div className="divide-y">
              {/* Group actions by urgency */}
              {['immediate', 'soon', 'when convenient'].map((urgency) => {
                const actionsForUrgency = result.recommendedActions.filter(
                  (action) => action.urgency === urgency
                );
                if (actionsForUrgency.length === 0) return null;

                return (
                  <div key={urgency} className="p-4">
                    <div className="mb-2">
                      <Badge
                        className={cn(
                          urgency === 'immediate'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                            : urgency === 'soon'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        )}
                      >
                        {urgency === 'immediate'
                          ? 'Do immediately'
                          : urgency === 'soon'
                          ? 'Do soon'
                          : 'When convenient'}
                      </Badge>
                    </div>
                    <ul className="space-y-2">
                      {actionsForUrgency.map((action, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="h-5 w-5 mt-0.5 flex-shrink-0">
                            {urgency === 'immediate' ? (
                              <AlertOctagon className="h-5 w-5 text-red-600 dark:text-red-400" />
                            ) : urgency === 'soon' ? (
                              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            ) : (
                              <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                            )}
                          </div>
                          <span className="text-sm">{action.action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Additional Notes */}
      {result.additionalNotes && (
        <div className="p-4 border-t">
          <h4 className="font-medium text-sm mb-1">Additional Notes:</h4>
          <p className="text-sm text-muted-foreground">{result.additionalNotes}</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="p-4 border-t bg-muted/30">
        <p className="text-xs text-muted-foreground">
          DISCLAIMER: This analysis is for informational purposes only and not a substitute for
          professional medical advice.
        </p>
      </div>
    </div>
  );
}
