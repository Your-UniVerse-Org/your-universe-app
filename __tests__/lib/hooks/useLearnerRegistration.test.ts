import { act, renderHook } from "@testing-library/react-native";
import { registerLearner } from "@/lib/api/learners";
import type { Learner, LearnerRegistrationInput } from "@/lib/api/types";
import { useLearnerRegistration } from "@/lib/hooks/useLearnerRegistration";

jest.mock("@/lib/api/learners");

const mockRegisterLearner = registerLearner as jest.MockedFunction<typeof registerLearner>;

const VALID_VALUES: LearnerRegistrationInput = {
  full_name: "Amara Nwosu",
  email: "amara.nwosu@example.com",
  school: "Riverbend High School",
  gender: "female",
  guardian_email: "guardian.nwosu@example.com",
  date_of_birth: "2012-05-14",
  phone_number: "+27821234567",
  password: "Sup3rSecret!",
};

const LEARNER: Learner = {
  id: "abc-123",
  full_name: VALID_VALUES.full_name,
  email: VALID_VALUES.email,
  school: VALID_VALUES.school,
  gender: "female",
  guardian_email: VALID_VALUES.guardian_email,
  date_of_birth: VALID_VALUES.date_of_birth,
  phone_number: VALID_VALUES.phone_number,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

async function fillValidForm(result: { current: ReturnType<typeof useLearnerRegistration> }) {
  // act() returns a thenable even for a synchronous callback — it must be awaited, or the
  // next act()/renderHook() call in the same test can start before this one's scope closes
  // ("overlapping act() calls"), leaving `result` unset.
  await act(() => {
    for (const [field, value] of Object.entries(VALID_VALUES)) {
      result.current.setField(field as keyof LearnerRegistrationInput, value as never);
    }
  });
}

afterEach(() => {
  // Scoped to our own mock only — jest.resetAllMocks() would also reset jest-expo's
  // internal native-module mocks that renderHook()/act() rely on, breaking every test
  // after the first.
  mockRegisterLearner.mockReset();
});

describe("useLearnerRegistration", () => {
  it("blocks submission and reports field errors when the form is invalid, without calling the API", async () => {
    const { result } = await renderHook(() => useLearnerRegistration());

    let submitted: boolean | undefined;
    await act(async () => {
      submitted = await result.current.handleSubmit();
    });

    expect(submitted).toBe(false);
    expect(mockRegisterLearner).not.toHaveBeenCalled();
    expect(result.current.fieldErrors.full_name).toBeDefined();
    expect(result.current.fieldErrors.email).toBeDefined();
  });

  it("hits the API and calls onSuccess when the form is valid", async () => {
    mockRegisterLearner.mockResolvedValue({ ok: true, learner: LEARNER });
    const onSuccess = jest.fn();
    const { result } = await renderHook(() => useLearnerRegistration(onSuccess));
    await fillValidForm(result);

    let submitted: boolean | undefined;
    await act(async () => {
      submitted = await result.current.handleSubmit();
    });

    expect(submitted).toBe(true);
    expect(mockRegisterLearner).toHaveBeenCalledWith(VALID_VALUES);
    expect(onSuccess).toHaveBeenCalledWith(LEARNER, VALID_VALUES);
    expect(result.current.fieldErrors).toEqual({});
    expect(result.current.formError).toBeUndefined();
  });

  it("surfaces server-side field errors (e.g. a rule the client missed)", async () => {
    mockRegisterLearner.mockResolvedValue({
      ok: false,
      error: { kind: "validation", fieldErrors: { phone_number: "Server says this is bad" } },
    });
    const { result } = await renderHook(() => useLearnerRegistration());
    await fillValidForm(result);

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.fieldErrors.phone_number).toBe("Server says this is bad");
  });

  it("surfaces a duplicate-email conflict as a form-level error", async () => {
    mockRegisterLearner.mockResolvedValue({
      ok: false,
      error: { kind: "conflict", message: "Learner with email 'x' already exists" },
    });
    const { result } = await renderHook(() => useLearnerRegistration());
    await fillValidForm(result);

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.formError).toBe("Learner with email 'x' already exists");
    expect(result.current.fieldErrors).toEqual({});
  });

  it("surfaces a network error as a form-level error", async () => {
    mockRegisterLearner.mockResolvedValue({
      ok: false,
      error: { kind: "network", message: "Couldn't reach the server. Check your connection and try again." },
    });
    const { result } = await renderHook(() => useLearnerRegistration());
    await fillValidForm(result);

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.formError).toMatch(/couldn't reach the server/i);
  });

  it("does not leave submitting stuck true after a failure", async () => {
    mockRegisterLearner.mockResolvedValue({ ok: false, error: { kind: "server", message: "boom" } });
    const { result } = await renderHook(() => useLearnerRegistration());
    await fillValidForm(result);

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.submitting).toBe(false);
  });

  it("clears a field's error as soon as it's edited", async () => {
    const { result } = await renderHook(() => useLearnerRegistration());

    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.fieldErrors.full_name).toBeDefined();

    await act(() => {
      result.current.setField("full_name", "Amara Nwosu");
    });

    expect(result.current.fieldErrors.full_name).toBeUndefined();
  });
});
