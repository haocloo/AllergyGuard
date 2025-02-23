// This file is for : Client and Server compatible functions

// external services
import { ZodError } from 'zod';

// services
import { User } from '@/lib/lucia/auth';
import { T_role } from '@/services/types';
import { MALAYSIA_CITIES, navList } from '@/services/constant';

export const FormValidationErrors = (error: any) => {
  if (error instanceof ZodError) {
    return {
      status: 'ERROR' as const,
      message: '',
      fieldErrors: error.flatten().fieldErrors,
    };
  } else if (error instanceof Error) {
    return {
      status: 'ERROR' as const,
      message: error.message,
      fieldErrors: {},
    };
  } else {
    return {
      status: 'ERROR' as const,
      message: 'An unknown error occurred',
      fieldErrors: {},
    };
  }
};

// make all the text lowercase if alphabet and the spaces should be replaced with -
export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-');
}

function getMinutesInMs(minutes: number) {
  return minutes * 60 * 1000;
}

export const RATE_LIMITS = {
  // customers
  orderHistory: { limit: 5, window: getMinutesInMs(2), label: 'Create Menu' },
  registerUser: { limit: 5, window: getMinutesInMs(1), label: 'Register User' },
} as const;

export class ErrorPage extends Error {
  statusCode: number;
  msg: string;

  constructor(message = 'Error', statusCode = 500) {
    super(message);
    this.name = 'ErrorPage';
    this.msg = message;
    this.statusCode = statusCode;
  }
}

export const get_nav_items = (user: User) => {
  return navList
    .map((group) => ({
      ...group,
      children: group.children
        .map((item) => ({
          ...item,
          items: item.items.filter((subItem) => subItem.role.includes(user.role as T_role)),
        }))
        .filter((item) => item.items.length > 0), // Ensure children items with no valid items are removed
    }))
    .filter((group) => group.children.length > 0); // Ensure groups with no valid children are removed
};

export const getCitiesByRegion = (region: keyof typeof MALAYSIA_CITIES) => {
  return (
    MALAYSIA_CITIES[region]?.map((city) => ({
      label: city,
      value: city,
    })) || []
  );
};

export const toTitleCase = (str: string) => {
  return str
    .replace(' ', '_')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
