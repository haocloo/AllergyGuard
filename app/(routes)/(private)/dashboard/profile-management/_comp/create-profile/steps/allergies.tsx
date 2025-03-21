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

interface Props {
  isEditing?: boolean;
  initialData?: Allergy[];
  onSave?: () => void;
  onCancel?: () => void;
  onNext?: () => void;
  onBack?: () => void;
}

interface ExtendedAllergy extends Allergy {
  isCustomAllergen?: boolean;
  symptoms: (AllergySymptom & { isCustom?: boolean })[];
}

export function AllergiesForm({ isEditing, initialData, onSave, onCancel, onNext, onBack }: Props) {
  const { formData, setField } = useProfileStore();
  const [customAllergen, setCustomAllergen] = useState('');
  const [customSymptom, setCustomSymptom] = useState('');

  const handleAddAllergy = () => {
    const newAllergy: ExtendedAllergy = {
      allergen: '',
      notes: '',
      symptoms: [],
      actionPlan: {
        immediateAction: '',
        medications: [],
      },
    };
    setField('allergies', [...(formData.allergies || []), newAllergy]);
  };

  const handleRemoveAllergy = (index: number) => {
    setField(
      'allergies',
      (formData.allergies || []).filter((_, i) => i !== index)
    );
  };

  const handleAllergyChange = (index: number, field: string, value: any) => {
    const newAllergies = [...(formData.allergies || [])];
    newAllergies[index] = { ...newAllergies[index], [field]: value };
    setField('allergies', newAllergies);
  };

  const handleSymptomAdd = (allergyIndex: number) => {
    const newAllergies = [...(formData.allergies || [])];
    const allergy = newAllergies[allergyIndex] as ExtendedAllergy;
    allergy.symptoms = [...(allergy.symptoms || []), { name: '', isCustom: false }];
    setField('allergies', newAllergies);
  };

  const handleSymptomRemove = (allergyIndex: number, symptomIndex: number) => {
    const newAllergies = [...(formData.allergies || [])];
    const allergy = newAllergies[allergyIndex] as ExtendedAllergy;
    allergy.symptoms = (allergy.symptoms || []).filter((_, i) => i !== symptomIndex);
    setField('allergies', newAllergies);
  };

  const handleActionAdd = (allergyIndex: number, field: keyof ActionPlan) => {
    const newAllergies = [...(formData.allergies || [])];
    const allergy = newAllergies[allergyIndex] as ExtendedAllergy;
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
    const newAllergies = [...(formData.allergies || [])];
    const allergy = newAllergies[allergyIndex] as ExtendedAllergy;
    if (!allergy.actionPlan.medications) allergy.actionPlan.medications = [];

    allergy.actionPlan.medications[medIndex] = {
      ...allergy.actionPlan.medications[medIndex],
      [field]: value,
    };

    setField('allergies', newAllergies);
  };

  const handleMedicationRemove = (allergyIndex: number, medIndex: number) => {
    const newAllergies = [...(formData.allergies || [])];
    const allergy = newAllergies[allergyIndex] as ExtendedAllergy;
    allergy.actionPlan.medications = allergy.actionPlan.medications.filter(
      (_, i) => i !== medIndex
    );
    setField('allergies', newAllergies);
  };

  const handleAllergenSelect = (index: number, value: string) => {
    const newAllergies = [...(formData.allergies || [])];
    const allergy = newAllergies[index] as ExtendedAllergy;

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
    const newAllergies = [...(formData.allergies || [])];
    const allergy = newAllergies[allergyIndex] as ExtendedAllergy;
    if (!allergy.symptoms) allergy.symptoms = [];

    if (value === 'Other') {
      allergy.symptoms[symptomIndex] = { name: '', isCustom: true };
    } else {
      allergy.symptoms[symptomIndex] = { name: value, isCustom: false };
    }

    setField('allergies', newAllergies);
  };

  const handleSymptomCustomChange = (allergyIndex: number, symptomIndex: number, value: string) => {
    const newAllergies = [...(formData.allergies || [])];
    const allergy = newAllergies[allergyIndex] as ExtendedAllergy;
    if (!allergy.symptoms) allergy.symptoms = [];
    allergy.symptoms[symptomIndex] = { ...allergy.symptoms[symptomIndex], name: value };
    setField('allergies', newAllergies);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Allergies</Label>
        <Button type="button" variant="outline" size="sm" onClick={handleAddAllergy}>
          <Plus className="h-4 w-4 mr-2" />
          Add Allergy
        </Button>
      </div>

      <div className="space-y-6">
        {(formData.allergies || []).map((rawAllergy, index) => {
          const allergy = rawAllergy as ExtendedAllergy;
          return (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-4">
                  {/* Allergen Selection */}
                  <div className="space-y-2">
                    <Label>Allergen</Label>
                    <div className="space-y-2">
                      <Select
                        value={
                          (allergy as ExtendedAllergy).isCustomAllergen ? 'Other' : allergy.allergen
                        }
                        onValueChange={(value) => handleAllergenSelect(index, value)}
                      >
                        <SelectTrigger className="w-full">
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
                      {(allergy as ExtendedAllergy).isCustomAllergen && (
                        <Input
                          placeholder="Enter custom allergen"
                          value={allergy.allergen}
                          onChange={(e) => handleAllergyChange(index, 'allergen', e.target.value)}
                        />
                      )}
                    </div>
                  </div>

                  {/* Symptoms Section */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="symptoms">
                      <AccordionTrigger className="text-sm font-medium">Symptoms</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4 px-4">
                          {(allergy.symptoms || []).map((rawSymptom, symptomIndex) => {
                            const symptom = rawSymptom as AllergySymptom & { isCustom?: boolean };
                            return (
                              <div key={symptomIndex} className="flex items-center gap-2">
                                <div className="flex-1 space-y-2">
                                  <Select
                                    value={symptom.isCustom ? 'Other' : symptom.name}
                                    onValueChange={(value) =>
                                      handleSymptomSelect(index, symptomIndex, value)
                                    }
                                  >
                                    <SelectTrigger className="w-full">
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
                                    />
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleSymptomRemove(index, symptomIndex)}
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
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Symptom
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Action Plan Section */}
                    <AccordionItem value="action-plan">
                      <AccordionTrigger className="text-sm font-medium">
                        Action Plan
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        {/* Immediate Action */}
                        <div className="space-y-2">
                          <Label>Immediate Action</Label>
                          <Textarea
                            value={(allergy as ExtendedAllergy).actionPlan?.immediateAction}
                            onChange={(e) =>
                              handleAllergyChange(
                                index,
                                'actionPlan.immediateAction',
                                e.target.value
                              )
                            }
                            placeholder="Describe the immediate action to take..."
                          />
                        </div>

                        {/* Medications */}
                        <div className="space-y-2 mt-4">
                          <Label>Medications</Label>
                          {(allergy as ExtendedAllergy).actionPlan?.medications.map(
                            (medication, medIndex) => (
                              <div key={medIndex} className="grid grid-cols-3 gap-2 mb-2">
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
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleMedicationRemove(index, medIndex)}
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
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Medication
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveAllergy(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
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
