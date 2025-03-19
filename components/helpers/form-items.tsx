export type FormState = {
  status: 'UNSET' | 'SUCCESS' | 'ERROR';
  message: React.ReactNode | string;
  fieldErrors: Record<string, string>;
  timestamp: number;
  redirect: string;
};

export const EMPTY_FORM_STATE: FormState = {
  status: 'UNSET' as const,
  message: '',
  fieldErrors: {},
  timestamp: Date.now(),
  redirect: '',
};

type FieldErrorProps = {
  formState: FormState;
  name: string;
  className?: string;
};

export const FieldError = ({
  formState,
  name,
  className,
}: {
  formState: FormState;
  name: string;
  className?: string;
}) => {
  const error = formState.fieldErrors[name];

  if (!error) return null;

  return (
    <p className={cn('text-sm font-medium text-destructive mt-1', className)} id={`error-${name}`}>
      {error}
    </p>
  );
};


import { cn } from '@/lib/cn';
import { ZodError } from 'zod';

export const fromErrorToFormState = (error: any, redirect: string = ''): FormState => {
  if (error instanceof ZodError) {
    const fieldErrors = error.errors.reduce((acc, err) => {
      const path = err.path.join('.');
      acc[path] = err.message;
      return acc;
    }, {} as Record<string, string>);
    return {
      status: 'ERROR' as const,
      message: (
        <div className="flex flex-col gap-y-1">
          <span className="text-sm font-semibold">Invalid Input</span>
          <div className="flex flex-col gap-1">
            {Object.entries(fieldErrors).map(([key, value], index) => {
              return (
                <p key={index} className="text-sm">
                  {key}: {value}
                </p>
              );
            })}
          </div>
        </div>
      ),
      fieldErrors,
      timestamp: Date.now(),
      redirect,
    };
  } else if (error instanceof Error) {
    return {
      status: 'ERROR' as const,
      message: (
        <div className="flex flex-col gap-y-1">
          <span className="text-sm font-semibold">Application Error</span>
          <div className="flex flex-col gap-1">
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        </div>
      ),
      fieldErrors: {},
      timestamp: Date.now(),
      redirect,
    };
  } else {
    return {
      status: 'ERROR' as const,
      message: (
        <div className="flex flex-col gap-y-1">
          <span className="text-sm font-semibold">Unknow Error</span>
          <div className="flex flex-col gap-1">
            <p className="text-sm mt-1">{(error as string) || 'An unknown error occurred'}</p>
          </div>
        </div>
      ),
      fieldErrors: {},
      timestamp: Date.now(),
      redirect,
    };
  }
};


export const toFormState = (
  status: FormState['status'],
  message: string,
  redirect: string = ''
): FormState => {
  return {
    status,
    message,
    fieldErrors: {},
    timestamp: Date.now(),
    redirect,
  };
};

export function scrollToFirstError(formState: FormState) {
  // Get all error fields
  const errorFields = Object.keys(formState.fieldErrors);
  if (errorFields.length === 0) return;

  // Find the first element with error
  for (const fieldName of errorFields) {
    // Convert nested field names (e.g., 'work.0.company_name' to 'work[0].company_name')
    const selector = `[data-error-field="${fieldName}"]`;
    const element = document.querySelector(selector);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      break;
    }
  }
}
    