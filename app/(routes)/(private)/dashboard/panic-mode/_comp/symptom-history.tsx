'use client';

import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ui
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, AlertTriangle, AlertOctagon, AlertCircle, History, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePanicModeStore } from './store';
import { cn } from '@/lib/cn';

export function SymptomHistory() {
  const [isOpen, setIsOpen] = useState(false);
  const { symptomHistory, setCurrentResponse } = usePanicModeStore();

  // Handle selecting a history item
  const handleSelectHistory = (index: number) => {
    setCurrentResponse(symptomHistory[index].symptomResponse);
    setIsOpen(false);
  };

  // Get urgency level icon
  const getHighestUrgencyIcon = (causes: Array<{ urgencyLevel: string }>) => {
    if (causes.some((cause) => cause.urgencyLevel === 'emergency')) {
      return <AlertOctagon className="h-4 w-4 text-red-600" />;
    }
    if (causes.some((cause) => cause.urgencyLevel === 'high')) {
      return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    }
    if (causes.some((cause) => cause.urgencyLevel === 'medium')) {
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
    return <Clock className="h-4 w-4 text-green-600" />;
  };

  // Get urgency level class
  const getHighestUrgencyClass = (causes: Array<{ urgencyLevel: string }>) => {
    if (causes.some((cause) => cause.urgencyLevel === 'emergency')) {
      return 'bg-red-100 text-red-800';
    }
    if (causes.some((cause) => cause.urgencyLevel === 'high')) {
      return 'bg-orange-100 text-orange-800';
    }
    if (causes.some((cause) => cause.urgencyLevel === 'medium')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-green-100 text-green-800';
  };

  // Get urgency level text
  const getHighestUrgencyText = (causes: Array<{ urgencyLevel: string }>) => {
    if (causes.some((cause) => cause.urgencyLevel === 'emergency')) {
      return 'Emergency';
    }
    if (causes.some((cause) => cause.urgencyLevel === 'high')) {
      return 'High';
    }
    if (causes.some((cause) => cause.urgencyLevel === 'medium')) {
      return 'Medium';
    }
    return 'Low';
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full flex items-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        <History className="h-4 w-4" />
        View Symptom History
        {symptomHistory.length > 0 && (
          <Badge variant="secondary" className="ml-2">
            {symptomHistory.length}
          </Badge>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Symptom Analysis History</DialogTitle>
          </DialogHeader>

          <div className="p-6 pt-4">
            {symptomHistory.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-medium text-lg mb-2">No Previous Analyses</h3>
                <p className="text-sm text-muted-foreground">
                  When you analyze symptoms, they will appear here for future reference.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(80vh-120px)] pr-4">
                <div className="space-y-4">
                  {symptomHistory.map((item, index) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleSelectHistory(index)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium line-clamp-2">
                            {item.symptomResponse.symptoms}
                          </p>
                          <div className="flex items-center gap-1 text-muted-foreground text-xs">
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatDistanceToNow(new Date(item.symptomResponse.createdAt))} ago
                            </span>
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            getHighestUrgencyClass(item.symptomResponse.possibleCauses),
                            'flex items-center gap-1'
                          )}
                        >
                          {getHighestUrgencyIcon(item.symptomResponse.possibleCauses)}
                          {getHighestUrgencyText(item.symptomResponse.possibleCauses)}
                        </Badge>
                      </div>

                      <div className="mt-2 text-xs text-muted-foreground">
                        <span className="font-medium">Top condition:</span>{' '}
                        {item.symptomResponse.possibleCauses[0]?.condition || 'Unknown'}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
