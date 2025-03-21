'use server';

import {
  lucia_get_user,
  utils_log_db_error,
  utils_log_server_error,
  utils_log_server_info,
} from '@/services/server';
import { DatabaseError } from 'pg';
import { pediatricAllergies } from '@/services/dummy-data';

// Define a type for the diagnosis result
export type DiagnosisResult = {
  id: number;
  percentageMatch: number;
  reason: string;
};

export async function get_diagnosis() {
  try {
    const { user } = await lucia_get_user();
    if (!user?.id) {
      await utils_log_server_info('get_diagnosis', 'Unauthenticated');
      return [];
    }

    // prompt: A 4-year-old develops itchy red patches after playground time, followed by sneezing and fast breathing. They seem dizzy when trying to stand.

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Instead of returning just the IDs, return objects with id, match percentage and reason
   return [
     {
       id: 104, // Insect Sting Anaphylaxis
       percentageMatch: 87,
       reason:
         'Itchy red patches, sneezing, fast breathing, and dizziness after playground time strongly point to an insect sting triggering an anaphylactic reaction.',
     },
     {
       id: 105, // Contact Dermatitis
       percentageMatch: 78,
       reason:
         'Itchy red patches after playground exposure suggest contact dermatitis from allergens, though respiratory symptoms are less typical for this condition.',
     },
     {
       id: 106, // Pollen-Induced Asthma Attack
       percentageMatch: 65,
       reason:
         'Sneezing and rapid breathing indicate a pollen-induced asthma attack, likely from outdoor allergens affecting both skin and airways.',
     },
   ] as DiagnosisResult[];
  } catch (error: any) {
    if (error instanceof DatabaseError) {
      await utils_log_db_error('get_diagnosis', error);
    } else {
      await utils_log_server_error('get_diagnosis', error.message);
    }
    return [];
  }
}
