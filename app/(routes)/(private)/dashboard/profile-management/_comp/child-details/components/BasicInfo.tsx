// BasicInfo.tsx - For the basic information section
import { format } from 'date-fns';
import { EditableField } from './EditableField';
import type { ExtendedChild } from '../types';

interface BasicInfoProps {
  child: ExtendedChild;
  onSave: (section: string, value: string) => void;
}

export function BasicInfo({ child, onSave }: BasicInfoProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium">Basic Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EditableField
          label="First Name"
          value={child.firstName || ''}
          onSave={(value) => onSave('firstName', value)}
        />
        <EditableField
          label="Last Name"
          value={child.lastName || ''}
          onSave={(value) => onSave('lastName', value)}
        />
        <EditableField
          label="Date of Birth"
          value={format(new Date(child.dob), 'PPP')}
          onSave={(value) => onSave('dob', value)}
        />
        <EditableField
          label="Gender"
          value={child.gender || 'Not specified'}
          onSave={(value) => onSave('gender', value)}
        />
      </div>
    </section>
  );
}
