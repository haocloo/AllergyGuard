'use server';

import {
  lucia_get_user,
  utils_log_db_error,
  utils_log_server_error,
  utils_log_server_info,
} from '@/services/server';
import { DatabaseError } from 'pg';

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

    return [104, 105, 106];
  } catch (error: any) {
    if (error instanceof DatabaseError) {
      await utils_log_db_error('get_diagnosis', error);
    } else {
      await utils_log_server_error('get_diagnosis', error.message);
    }
    return [];
  }
}
