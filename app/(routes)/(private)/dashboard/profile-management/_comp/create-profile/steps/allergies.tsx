'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useProfileStore } from '../../store';
import { COMMON_ALLERGENS, COMMON_SYMPTOMS } from '../../types';
import type { Allergy, AllergySymptom, ActionPlan } from '../../types';
import { cn } from '@/lib/cn';

interface Props {
  isEditing?: boolean;
  initialData?: Allergy[];
  onSave?: () => void;
  onCancel?: () => void;
  onNext?: () => void;
  onBack?: () => void;
}

type AllergyField = keyof Pick<Allergy, 'allergen' | 'notes'>;
type AllergySeverity = 'Low' | 'Medium' | 'High';

// Update the section colors with more refined gradients and styling
const sectionColors = {
  allergen:
    'bg-gradient-to-r from-blue-50 to-indigo-50/70 dark:from-blue-900/40 dark:to-indigo-900/30 border-blue-200 dark:border-blue-800/70',
  symptoms:
    'bg-gradient-to-r from-amber-50 to-yellow-50/70 dark:from-amber-900/40 dark:to-yellow-900/30 border-amber-200 dark:border-amber-800/70',
  actionPlan:
    'bg-gradient-to-r from-emerald-50 to-green-50/70 dark:from-emerald-900/40 dark:to-green-900/30 border-emerald-200 dark:border-emerald-800/70',
  medication:
    'bg-gradient-to-r from-violet-50 to-purple-50/70 dark:from-violet-900/40 dark:to-purple-900/30 border-violet-200 dark:border-violet-800/70',
  severity: {
    Low: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/60 dark:to-emerald-900/40 border-green-200 dark:border-green-800/70 text-green-700 dark:text-green-300 shadow-sm',
    Medium:
      'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/60 dark:to-yellow-900/40 border-amber-200 dark:border-amber-800/70 text-amber-700 dark:text-amber-300 shadow-sm',
    High: 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/60 dark:to-rose-900/40 border-red-200 dark:border-red-800/70 text-red-700 dark:text-red-300 shadow-sm',
  },
  allergyCard:
    'bg-gradient-to-r from-slate-50/80 to-gray-50/60 dark:from-slate-900/60 dark:to-gray-900/40',
  addButton:
    'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800/70',
};

export function AllergiesForm({ isEditing, initialData, onSave, onCancel, onNext, onBack }: Props) {
  const { formData, setField } = useProfileStore();
  const [customAllergen, setCustomAllergen] = useState('');
  const [customSymptom, setCustomSymptom] = useState('');

  const handleAddAllergy = () => {
    const newAllergy: Allergy = {
      allergen: '',
      notes: '',
      severity: 'Low',
      symptoms: [],
      actionPlan: {
        immediateAction: '',
        medications: [],
      },
    };
    setField('allergies', [...formData.allergies, newAllergy]);
  };

  const handleRemoveAllergy = (index: number) => {
    setField(
      'allergies',
      formData.allergies.filter((_, i) => i !== index)
    );
  };

  const handleAllergyChange = (
    index: number,
    field: AllergyField | 'severity' | 'actionPlan.immediateAction',
    value: string
  ) => {
    const newAllergies = [...formData.allergies];
    const allergy = newAllergies[index];

    if (field === 'actionPlan.immediateAction') {
      allergy.actionPlan = {
        ...allergy.actionPlan,
        immediateAction: value,
      };
    } else if (field === 'severity') {
      // Validate severity value
      if (value === 'Low' || value === 'Medium' || value === 'High') {
        allergy.severity = value;
      }
    } else {
      // Handle other string fields
      allergy[field] = value;
    }

    setField('allergies', newAllergies);
  };

  const handleSymptomAdd = (allergyIndex: number) => {
    const newAllergies = [...formData.allergies];
    const allergy = newAllergies[allergyIndex];
    const newSymptom: AllergySymptom = { name: '', isCustom: false };
    allergy.symptoms = [...(allergy.symptoms || []), newSymptom];
    setField('allergies', newAllergies);
  };

  const handleSymptomRemove = (allergyIndex: number, symptomIndex: number) => {
    const newAllergies = [...formData.allergies];
    const allergy = newAllergies[allergyIndex] as Allergy;
    allergy.symptoms = (allergy.symptoms || []).filter((_, i) => i !== symptomIndex);
    setField('allergies', newAllergies);
  };

  const handleActionAdd = (allergyIndex: number, field: keyof ActionPlan) => {
    const newAllergies = [...formData.allergies];
    const allergy = newAllergies[allergyIndex] as Allergy;
    if (!allergy.actionPlan) {
      allergy.actionPlan = {
        immediateAction: '',
        medications: [],
      };
    }

    if (field === 'medications') {
      allergy.actionPlan.medications = [
        ...(allergy.actionPlan.medications || []),
        { name: '', dosage: '' },
      ];
    } else if (field === 'immediateAction') {
      if (!allergy.actionPlan.immediateAction) {
        allergy.actionPlan.immediateAction = '';
      }
    }

    setField('allergies', newAllergies);
  };

  const handleMedicationChange = (
    allergyIndex: number,
    medIndex: number,
    field: 'name' | 'dosage',
    value: string
  ) => {
    const newAllergies = [...formData.allergies];
    const allergy = newAllergies[allergyIndex] as Allergy;
    if (!allergy.actionPlan.medications) allergy.actionPlan.medications = [];

    allergy.actionPlan.medications[medIndex] = {
      ...allergy.actionPlan.medications[medIndex],
      [field]: value,
    };

    setField('allergies', newAllergies);
  };

  const handleMedicationRemove = (allergyIndex: number, medIndex: number) => {
    const newAllergies = [...formData.allergies];
    const allergy = newAllergies[allergyIndex] as Allergy;
    allergy.actionPlan.medications = allergy.actionPlan.medications.filter(
      (_, i) => i !== medIndex
    );
    setField('allergies', newAllergies);
  };

  const handleAllergenSelect = (index: number, value: string) => {
    const newAllergies = [...formData.allergies];
    const allergy = newAllergies[index] as Allergy;

    if (value === 'Other') {
      allergy.isCustomAllergen = true;
      allergy.allergen = '';
    } else {
      allergy.isCustomAllergen = false;
      allergy.allergen = value;
    }

    setField('allergies', newAllergies);
  };

  const handleSymptomSelect = (allergyIndex: number, symptomIndex: number, value: string) => {
    const newAllergies = [...formData.allergies];
    const allergy = newAllergies[allergyIndex];
    if (!allergy.symptoms) allergy.symptoms = [];

    const newSymptom: AllergySymptom = {
      name: value === 'Other' ? '' : value,
      isCustom: value === 'Other',
    };
    allergy.symptoms[symptomIndex] = newSymptom;

    setField('allergies', newAllergies);
  };

  const handleSymptomCustomChange = (allergyIndex: number, symptomIndex: number, value: string) => {
    const newAllergies = [...formData.allergies];
    const allergy = newAllergies[allergyIndex];
    if (!allergy.symptoms) allergy.symptoms = [];

    const updatedSymptom: AllergySymptom = {
      ...allergy.symptoms[symptomIndex],
      name: value,
    };
    allergy.symptoms[symptomIndex] = updatedSymptom;

    setField('allergies', newAllergies);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {(formData.allergies || []).map((rawAllergy, index) => {
          const allergy = rawAllergy as Allergy;
          return (
            <div
              key={index}
              className={cn(
                'relative border rounded-lg p-4 space-y-4 shadow-md',
                sectionColors.allergyCard
              )}
            >
              {/* Allergy Header with Number and Delete Button */}
              <div className="flex items-center justify-between mb-2 pb-2 border-b">
                <h3 className="font-medium text-base flex items-center">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm mr-2">
                    {index + 1}
                  </span>
                  Allergy {index + 1}
                </h3>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleRemoveAllergy(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-4">
                  {/* Allergen Selection */}
                  <div
                    className={cn(
                      'space-y-2 p-3 rounded-lg border shadow-sm',
                      sectionColors.allergen
                    )}
                  >
                    <Label className="font-medium">Allergen</Label>
                    <div className="space-y-2">
                      <Select
                        value={(allergy as Allergy).isCustomAllergen ? 'Other' : allergy.allergen}
                        onValueChange={(value) => handleAllergenSelect(index, value)}
                      >
                        <SelectTrigger className="w-full bg-white dark:bg-gray-950 border-blue-100 dark:border-blue-900/50">
                          <SelectValue placeholder="Select allergen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Common Allergens</SelectLabel>
                            {COMMON_ALLERGENS.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {(allergy as Allergy).isCustomAllergen && (
                        <Input
                          placeholder="Enter custom allergen"
                          value={allergy.allergen}
                          onChange={(e) => handleAllergyChange(index, 'allergen', e.target.value)}
                          className="bg-white dark:bg-gray-950 border-blue-100 dark:border-blue-900/50"
                        />
                      )}
                    </div>
                  </div>

                  {/* Severity Section */}
                  <div className="space-y-2 p-3 rounded-lg border shadow-sm bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/40 dark:to-sky-900/30 border-blue-100 dark:border-blue-900/50">
                    <Label className="font-medium">Severity</Label>
                    <div className="flex gap-2 pt-1">
                      {(['Low', 'Medium', 'High'] as AllergySeverity[]).map((severity) => (
                        <button
                          key={severity}
                          type="button"
                          onClick={() => handleAllergyChange(index, 'severity', severity)}
                          className={cn(
                            'px-3 py-1.5 rounded-md border text-sm font-medium transition-all',
                            'hover:opacity-90 active:scale-95',
                            allergy.severity === severity
                              ? sectionColors.severity[severity]
                              : 'bg-white dark:bg-gray-950 border-muted/60 text-muted-foreground'
                          )}
                        >
                          {severity}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Symptoms Section */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem
                      value="symptoms"
                      className={cn(
                        'rounded-lg overflow-hidden border shadow-sm',
                        sectionColors.symptoms
                      )}
                    >
                      <AccordionTrigger className="text-sm font-medium p-3 bg-gradient-to-r from-amber-100 to-yellow-50 dark:from-amber-900/50 dark:to-yellow-900/30 hover:from-amber-200 hover:to-yellow-100 dark:hover:from-amber-900/70 dark:hover:to-yellow-900/50 transition-all duration-300">
                        Symptoms
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4 px-4 pb-4 bg-gradient-to-b from-amber-50/40 to-white dark:from-amber-950/30 dark:to-gray-950">
                          {(allergy.symptoms || []).map((rawSymptom, symptomIndex) => {
                            const symptom = rawSymptom as AllergySymptom & { isCustom?: boolean };
                            return (
                              <div key={symptomIndex} className="flex items-center gap-2 relative">
                                <div className="flex-1 space-y-2">
                                  <Select
                                    value={symptom.isCustom ? 'Other' : symptom.name}
                                    onValueChange={(value) =>
                                      handleSymptomSelect(index, symptomIndex, value)
                                    }
                                  >
                                    <SelectTrigger className="w-full bg-white dark:bg-gray-950 border-amber-100 dark:border-amber-900/50">
                                      <SelectValue placeholder="Select symptom" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectGroup>
                                        <SelectLabel>Common Symptoms</SelectLabel>
                                        {COMMON_SYMPTOMS.map((item) => (
                                          <SelectItem key={item} value={item}>
                                            {item}
                                          </SelectItem>
                                        ))}
                                      </SelectGroup>
                                    </SelectContent>
                                  </Select>
                                  {symptom.isCustom && (
                                    <Input
                                      placeholder="Enter custom symptom"
                                      value={symptom.name}
                                      onChange={(e) =>
                                        handleSymptomCustomChange(
                                          index,
                                          symptomIndex,
                                          e.target.value
                                        )
                                      }
                                      className="bg-white dark:bg-gray-950 border-amber-100 dark:border-amber-900/50"
                                    />
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSymptomRemove(index, symptomIndex)}
                                  className="h-8 w-8 absolute right-0 top-1"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })}
                          <div className="pt-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleSymptomAdd(index)}
                              className="bg-white dark:bg-gray-950 border-amber-100 dark:border-amber-900/50"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Symptom
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Action Plan Section */}
                    <AccordionItem
                      value="action-plan"
                      className={cn(
                        'rounded-lg overflow-hidden border mt-3 shadow-sm',
                        sectionColors.actionPlan
                      )}
                    >
                      <AccordionTrigger className="text-sm font-medium p-3 bg-gradient-to-r from-emerald-100 to-green-50 dark:from-emerald-900/50 dark:to-green-900/30 hover:from-emerald-200 hover:to-green-100 dark:hover:from-emerald-900/70 dark:hover:to-green-900/50 transition-all duration-300">
                        Action Plan
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4 bg-gradient-to-b from-emerald-50/40 to-white dark:from-emerald-950/30 dark:to-gray-950 p-4">
                        {/* Immediate Action */}
                        <div className="space-y-2">
                          <Label>Immediate Action</Label>
                          <Textarea
                            value={allergy.actionPlan?.immediateAction}
                            onChange={(e) =>
                              handleAllergyChange(
                                index,
                                'actionPlan.immediateAction',
                                e.target.value
                              )
                            }
                            placeholder="Describe the immediate action to take..."
                            className="bg-white dark:bg-gray-950 border-emerald-100 dark:border-emerald-900/50"
                          />
                        </div>

                        {/* Medications */}
                        <div
                          className={cn(
                            'space-y-2 mt-4 p-3 rounded-lg border shadow-sm',
                            sectionColors.medication
                          )}
                        >
                          <Label className="font-medium">Medications</Label>
                          {(allergy as Allergy).actionPlan?.medications.map(
                            (medication, medIndex) => (
                              <div key={medIndex} className="grid grid-cols-3 gap-2 mb-2 relative">
                                <div className="col-span-2">
                                  <Input
                                    value={medication.name}
                                    onChange={(e) =>
                                      handleMedicationChange(
                                        index,
                                        medIndex,
                                        'name',
                                        e.target.value
                                      )
                                    }
                                    placeholder="Medication name"
                                    className="bg-white dark:bg-gray-950 border-violet-100 dark:border-violet-900/50"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Input
                                    value={medication.dosage}
                                    onChange={(e) =>
                                      handleMedicationChange(
                                        index,
                                        medIndex,
                                        'dosage',
                                        e.target.value
                                      )
                                    }
                                    placeholder="Dosage"
                                    className="bg-white dark:bg-gray-950 border-violet-100 dark:border-violet-900/50"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleMedicationRemove(index, medIndex)}
                                    className="h-8 w-8"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleActionAdd(index, 'medications')}
                            className="bg-white dark:bg-gray-950 border-violet-100 dark:border-violet-900/50"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Medication
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Allergy Button moved to the bottom */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddAllergy}
          className={cn('w-full justify-center', sectionColors.addButton)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Allergy
        </Button>
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
