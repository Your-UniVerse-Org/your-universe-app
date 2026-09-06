import { useCallback, useState } from "react";
import type { LearnerFieldErrors } from "@/lib/api/errors";
import { registerLearner } from "@/lib/api/learners";
import type { Learner, LearnerRegistrationInput } from "@/lib/api/types";
import { validateLearnerForm } from "@/lib/validation/learner";

const INITIAL_VALUES: LearnerRegistrationInput = {
  full_name: "",
  email: "",
  school: "",
  gender: null,
  guardian_email: "",
  date_of_birth: "",
  phone_number: "",
  password: "",
};

/** Drives the learner registration form: field state, validate-before-submit, calling the
 * API, and mapping whatever comes back (client validation, server validation, duplicate
 * email, network/server failure) into field-level and form-level errors the screen renders.
 * Kept separate from the screen component so it's testable without rendering any UI. */
export function useLearnerRegistration(
  onSuccess?: (learner: Learner, input: LearnerRegistrationInput) => void,
) {
  const [values, setValues] = useState<LearnerRegistrationInput>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<LearnerFieldErrors>({});
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const setField = useCallback(
    <K extends keyof LearnerRegistrationInput>(field: K, value: LearnerRegistrationInput[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      setFieldErrors((prev) => {
        if (!(field in prev)) return prev;
        const next = { ...prev };
        delete next[field as keyof LearnerFieldErrors];
        return next;
      });
      setFormError(undefined);
    },
    [],
  );

  const handleSubmit = useCallback(async (): Promise<boolean> => {
    const clientErrors = validateLearnerForm(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setFormError(undefined);
      return false;
    }

    setSubmitting(true);
    setFormError(undefined);
    try {
      const result = await registerLearner(values);
      if (result.ok) {
        setFieldErrors({});
        onSuccess?.(result.learner, values);
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
  }, [values, onSuccess]);

  return { values, setField, fieldErrors, formError, submitting, handleSubmit };
}
