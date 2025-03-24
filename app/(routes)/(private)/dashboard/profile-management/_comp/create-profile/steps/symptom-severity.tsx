'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/cn';
import { useProfileStore } from '../../store';
import { SEVERITY_COLORS } from '../../types';
import type { SymptomSeverity, Symptom } from '../../types';
import { useEffect } from 'react';

interface Props {
  isEditing?: boolean;
  initialData?: Symptom[];
  onSave?: () => void;
  onCancel?: () => void;
  onNext?: () => void;
  onBack?: () => void;
}

const severityOptions: { value: SymptomSeverity; label: string }[] = [
  { value: 'Mild', label: 'Mild' },
  { value: 'Moderate', label: 'Moderate' },
  { value: 'Severe', label: 'Severe' },
];

export function SymptomSeverityForm({
  isEditing,
  initialData,
  onSave,
  onCancel,
  onNext,
  onBack,
}: Props) {
  const { formData, setField } = useProfileStore();

  // Initialize with initial data if in edit mode
  useEffect(() => {
    if (isEditing && initialData) {
      setField('symptoms', initialData);
    }
  }, [isEditing, initialData, setField]);

  // Collect all unique symptoms from allergies
  const allSymptoms = formData.allergies?.reduce((acc, allergy) => {
    allergy.symptoms.forEach((symptom) => {
      if (!acc.some((s) => s.name === symptom.name)) {
        acc.push({ name: symptom.name, severity: 'Mild' as SymptomSeverity });
      }
    });
    return acc;
  }, [] as { name: string; severity: SymptomSeverity }[]);

  const handleSeverityChange = (symptomName: string, severity: SymptomSeverity) => {
    const newSymptoms = [...(formData.symptoms || [])];
    const existingIndex = newSymptoms.findIndex((s) => s.name === symptomName);

    if (existingIndex >= 0) {
      newSymptoms[existingIndex] = { ...newSymptoms[existingIndex], severity };
    } else {
      newSymptoms.push({ name: symptomName, severity });
    }

    setField('symptoms', newSymptoms);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Symptom Severity</h2>
        <p className="text-sm text-muted-foreground">Set the severity level for each symptom</p>
      </div>

      <div className="space-y-4">
        {allSymptoms?.map((symptom) => {
          const currentSeverity =
            formData.symptoms?.find((s) => s.name === symptom.name)?.severity || 'Mild';

          return (
            <div
              key={symptom.name}
              className={cn(
                'p-4 rounded-lg border transition-colors',
                SEVERITY_COLORS[currentSeverity]
              )}
            >
              <div className="flex flex-col items-center gap-2">
                <Label className="text-base font-medium">{symptom.name}</Label>
                <div className="relative w-full">
                  <ToggleGroup
                    type="single"
                    value={currentSeverity}
                    onValueChange={(value) => {
                      if (value) handleSeverityChange(symptom.name, value as SymptomSeverity);
                    }}
                    className="relative bg-muted p-1 rounded-lg w-full"
                  >
                    {severityOptions.map((option) => (
                      <ToggleGroupItem
                        key={option.value}
                        value={option.value}
                        className={cn(
                          'relative z-10 transition-all data-[state=on]:text-white',
                          'flex-1 px-4 py-1.5 rounded-md text-sm font-medium'
                        )}
                        aria-label={`Set severity to ${option.label}`}
                      >
                        {option.label}
                      </ToggleGroupItem>
                    ))}
                    <div
                      className={cn(
                        'absolute top-1 left-1 transition-transform duration-200 rounded-md h-[calc(100%-8px)]',
                        'w-[calc((100%-8px)/3)]',
                        {
                          'translate-x-0 bg-green-500': currentSeverity === 'Mild',
                          'translate-x-[100%] bg-yellow-500': currentSeverity === 'Moderate',
                          'translate-x-[200%] bg-red-500': currentSeverity === 'Severe',
                        }
                      )}
                    />
                  </ToggleGroup>
                </div>
              </div>
            </div>
          );
        })}

        {(!allSymptoms || allSymptoms.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            No symptoms have been added. Please add symptoms in the previous step.
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onSave}>Save Changes</Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={onBack}>
              Previous Step
            </Button>
            <Button onClick={onNext}>Next Step</Button>
          </>
        )}
      </div>
    </div>
  );
}
