import { useCallback, useState } from "react";
import { useSession } from "@/components/SessionContext";
import type { LearnerLoginInput } from "@/lib/api/types";
import { validateLoginForm, type LoginFieldErrors } from "@/lib/validation/auth";

const INITIAL_VALUES: LearnerLoginInput = { email: "", password: "" };

/** Drives the learner login form: field state, validate-before-submit, calling
 * `SessionContext.login` (which hits POST /learners/login and persists the resulting tokens),
 * and mapping whatever comes back into field-level and form-level errors the screen renders.
 * Kept separate from the screen so it's testable without rendering any UI — mirrors
 * useLearnerRegistration.ts. */
export function useLearnerLogin(onSuccess?: () => void) {
  const { login } = useSession();
  const [values, setValues] = useState<LearnerLoginInput>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const setField = useCallback(<K extends keyof LearnerLoginInput>(field: K, value: LearnerLoginInput[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field as keyof LoginFieldErrors];
      return next;
    });
    setFormError(undefined);
  }, []);

  const handleSubmit = useCallback(async (): Promise<boolean> => {
    const clientErrors = validateLoginForm(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setFormError(undefined);
      return false;
    }

    setSubmitting(true);
    setFormError(undefined);
    try {
      const result = await login(values.email, values.password);
      if (result.ok) {
        setFieldErrors({});
        onSuccess?.();
        return true;
      }

      const { error } = result;
      if (error.kind === "validation") {
        setFieldErrors(error.fieldErrors);
        setFormError(error.formError);
      } else {
        setFieldErrors({});
        setFormError(error.message);
      }
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [values, login, onSuccess]);

  return { values, setField, fieldErrors, formError, submitting, handleSubmit };
}
