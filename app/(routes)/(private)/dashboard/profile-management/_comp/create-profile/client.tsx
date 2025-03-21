'use client';

import { useState } from 'react';
import { Steps } from './steps';
import { BasicInfoForm } from './steps/basic-info';
import { AllergiesForm } from './steps/allergies';
import { SymptomSeverityForm } from './steps/symptom-severity';
import { EmergencyContactForm } from './steps/emergency-contact';

const steps = [
  { title: 'Basic Information', description: 'Personal details' },
  { title: 'Allergies', description: 'Allergy information' },
  { title: 'Symptom Severity', description: 'Symptoms and triggers' },
  { title: 'Emergency Contacts', description: 'Contact information' },
];

export function CreateProfileClient() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="max-w-3xl mx-auto w-full space-y-8 pb-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Children Profile</h1>
        <p className="text-sm text-muted-foreground">
          Create a new profile by completing all required information
        </p>
      </div>

      <Steps steps={steps} currentStep={currentStep} />

      <div className="mt-8">
        {currentStep === 0 && <BasicInfoForm onNext={() => setCurrentStep(1)} />}
        {currentStep === 1 && (
          <AllergiesForm onNext={() => setCurrentStep(2)} onBack={() => setCurrentStep(0)} />
        )}
        {currentStep === 2 && (
          <SymptomSeverityForm onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />
        )}
        {currentStep === 3 && <EmergencyContactForm onBack={() => setCurrentStep(2)} />}
      </div>
    </div>
  );
}
