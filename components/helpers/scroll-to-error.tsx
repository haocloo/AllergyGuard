import { FormState } from "@/components/helpers/form-items";

export function scrollToFirstError(formState: FormState) {
  // Get all error fields
  const errorFields = Object.keys(formState.fieldErrors);
  if (errorFields.length === 0) return;

  // Find the first element with error
  for (const fieldName of errorFields) {
    // Convert nested field names (e.g., 'work.0.company_name' to 'work[0].company_name')
    const selector = `[name="${fieldName}"], [data-error-field="${fieldName}"]`;
    const element = document.querySelector(selector);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      break;
    }
  }
}
    