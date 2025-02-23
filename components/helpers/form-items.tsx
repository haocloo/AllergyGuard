export type FormState = {
  status: "UNSET" | "SUCCESS" | "ERROR";
  message: string;
  fieldErrors: Record<string, string>;
  timestamp: number;
  redirect: string;
};

export const EMPTY_FORM_STATE: FormState = {
  status: "UNSET" as const,
  message: "",
  fieldErrors: {},
  timestamp: Date.now(),
  redirect: "",
};

type FieldErrorProps = {
  formState: FormState;
  name: string;
  className?: string;
};

export const FieldError = ({ formState, name }: { formState: FormState; name: string }) => {
  const error = formState.fieldErrors[name];
  
  if (!error) return null;
  
  return (
    <p className="text-sm text-destructive mt-1" id={`error-${name}`}>
      {error}
    </p>
  );
};

import { ZodError } from "zod";

export const fromErrorToFormState = (error: any, redirect: string = "") => {
  if (error instanceof ZodError) {
    return {
      status: "ERROR" as const,
      message: "Invalid input",
      // fieldErrors: error.flatten().fieldErrors,
      fieldErrors: error.errors.reduce((acc, err) => {
        const path = err.path.join(".");
        acc[path] = err.message;
        return acc;
      }, {} as Record<string, string>),
      timestamp: Date.now(),
      redirect,
    };
  } else if (error instanceof Error) {
    return {
      status: "ERROR" as const,
      message: error.message,
      fieldErrors: {},
      timestamp: Date.now(),
      redirect,
    };
  } else {
    return {
      status: "ERROR" as const,
      message: error as string || "An unknown error occurred",
      fieldErrors: {},
      timestamp: Date.now(),
      redirect,
    };
  }
};

export const toFormState = (
  status: FormState["status"],
  message: string,
  redirect: string = ""
): FormState => {
  return {
    status,
    message,
    fieldErrors: {},
    timestamp: Date.now(),
    redirect,
  };
};

export const scrollToFirstError = (formState: FormState) => {
  const firstErrorField = Object.keys(formState.fieldErrors)[0];
  if (firstErrorField) {
    const errorElement = document.getElementById(`error-${firstErrorField}`);
    errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};
