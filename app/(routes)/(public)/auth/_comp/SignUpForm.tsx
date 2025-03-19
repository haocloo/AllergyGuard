'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// ui
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Bold, Briefcase, Italic, School, Underline, User2 } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// pui
import { FieldError, FormState } from '@/components/helpers/form-items';

// external
import { useTranslations } from 'next-intl';

// services
import { EMPTY_FORM_STATE } from '@/components/helpers/form-items';
import { T_role, T_user_register_form } from '@/services/types';
import { create_user } from '@/services/server';
import { Button } from '@/components/ui/button';

interface SignUpFormProps {
  name: string;
  phone: string;
  role: T_role | '';
}

export default function SignUpForm({ name, phone, role }: SignUpFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const tNotification = useTranslations('notification');
  const tAuth = useTranslations('auth');

  const [pending, setPending] = useState(false);
  const [formState, setFormState] = useState<FormState>(EMPTY_FORM_STATE);
  const [formData, setFormData] = useState({
    name,
    role: role || '',
    phone: phone || '',
  });
  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setPending(true);

    try {
      let cleanUser: T_user_register_form = {
        name: formData.name,
        phone: formData.phone,
        role: formData.role as T_role,
      };

      const res = await create_user(cleanUser);
      setFormState(res);
      if (res.status === 'SUCCESS') {
        toast({
          title: tNotification('success.label'),
          description: tNotification('success.create.register user'),
          variant: 'success',
        });
        router.push('/dashboard');
      } else {
        if (
          String(res.message).startsWith(
            'DB_create_user: error: duplicate key value violates unique constraint'
          )
        ) {
          toast({
            title: tNotification('error.label'),
            description: tAuth('duplicate user'),
            variant: 'destructive',
          });
        } else {
          toast({
            title: tNotification('error.label'),
            description: tNotification('error.create.register user') + res.message,
            variant: 'destructive',
          });
        }
        setFormState(res);
      }
    } catch (error: any) {
      toast({
        title: tNotification('error.label'),
        description: tNotification('error.create.register user') + error,
        variant: 'destructive',
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* name */}
      <div>
        <Label htmlFor="name">{tAuth('full name')}</Label>
        <Input
          name="name"
          type="text"
          placeholder="Full Name"
          value={formData?.name}
          onChange={(e) => handleChange('name', e.target.value)}
          isError={!!formState.fieldErrors['name']}
          disabled={pending}
          required
        />
        <FieldError formState={formState} name="name" />
      </div>

      {/* phone number */}
      <div>
        <Label htmlFor="phone">{tAuth('phone')}</Label>
        <Input
          type="text"
          name="phone"
          placeholder="0123456789"
          value={formData?.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          isError={!!formState.fieldErrors.phone}
          disabled={pending}
          required
        />
        <FieldError formState={formState} name="phone" />
      </div>

      {/* role */}
      <div className="flex flex-col justify-start gap-2">
        <Label htmlFor="role">{tAuth('role')}</Label>
        <ToggleGroup
          className="justify-start"
          type="single"
          value={formData.role}
          onValueChange={(value) => {
            handleChange('role', value);
          }}
        >
          <ToggleGroupItem
            value="caretaker"
            aria-label="Caretaker role"
            className="flex gap-2 items-center data-[state=on]:bg-blue-600/90 data-[state=on]:text-white"
          >
            <User2 className="h-4 w-4" />
            <span>Caretaker</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="parent"
            aria-label="Parent role"
            className="flex gap-2 items-center data-[state=on]:bg-blue-600/90 data-[state=on]:text-white"
          >
            <Briefcase className="h-4 w-4" />
            <span>Parent</span>
          </ToggleGroupItem>
        </ToggleGroup>
        {formState.fieldErrors.role && <FieldError formState={formState} name="role" />}
      </div>

      {/* submit button */}
      <Button type="submit" variant="default" className="w-full mb-2" disabled={pending}>
        {tAuth('create account')}
      </Button>
    </form>
  );
}
