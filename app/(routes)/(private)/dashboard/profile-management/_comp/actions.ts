'use server';

import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { FormState } from '@/components/helpers/form-items';
import { toFormState, fromErrorToFormState } from '@/components/helpers/form-items';
import { T_schema_create_child } from './types';
import { schema_create_child } from './validation';
import { utils_log_server_error } from '@/services/server';

export async function createChild(data: T_schema_create_child): Promise<FormState> {
  try {
    // Validate data
    const validatedData = schema_create_child.parse(data);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    revalidatePath('/dashboard/profile-management');
    return toFormState('SUCCESS', 'Child profile created successfully');
  } catch (error: any) {
    await utils_log_server_error('createChild', error);
    return fromErrorToFormState(error);
  }
}

export async function updateChild(
  childId: string,
  data: Partial<T_schema_create_child>
): Promise<FormState> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    revalidatePath('/dashboard/profile-management');
    return toFormState('SUCCESS', 'Child profile updated successfully');
  } catch (error: any) {
    await utils_log_server_error('updateChild', error);
    return fromErrorToFormState(error);
  }
}

export async function deleteChild(childId: string): Promise<FormState> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    revalidatePath('/dashboard/profile-management');
    return toFormState('SUCCESS', 'Child profile deleted successfully');
  } catch (error: any) {
    await utils_log_server_error('deleteChild', error);
    return fromErrorToFormState(error);
  }
}
