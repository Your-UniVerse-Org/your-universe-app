import { act, renderHook } from "@testing-library/react-native";
import { useSession } from "@/components/SessionContext";
import type { LearnerLoginInput } from "@/lib/api/types";
import { useLearnerLogin } from "@/lib/hooks/useLearnerLogin";

jest.mock("@/components/SessionContext");

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockLogin = jest.fn();

const VALID_VALUES: LearnerLoginInput = {
  email: "amara.nwosu@example.com",
  password: "Sup3rSecret!",
};

async function fillValidForm(result: { current: ReturnType<typeof useLearnerLogin> }) {
  // act() returns a thenable even for a synchronous callback — it must be awaited, or the
  // next act()/renderHook() call in the same test can start before this one's scope closes
  // ("overlapping act() calls"), leaving `result` unset (see useLearnerRegistration.test.ts).
  await act(() => {
    result.current.setField("email", VALID_VALUES.email);
    result.current.setField("password", VALID_VALUES.password);
  });
}

beforeEach(() => {
  mockUseSession.mockReturnValue({
    status: "signedOut",
    accessToken: null,
    login: mockLogin,
    logout: jest.fn(),
  });
});

afterEach(() => {
  // Scoped to our own mocks only — jest.resetAllMocks() would also reset jest-expo's internal
  // native-module mocks that renderHook()/act() rely on.
  mockLogin.mockReset();
  mockUseSession.mockReset();
});

describe("useLearnerLogin", () => {
  it("blocks submission and reports field errors when the form is invalid, without calling login", async () => {
    const { result } = await renderHook(() => useLearnerLogin());

    let submitted: boolean | undefined;
    await act(async () => {
      submitted = await result.current.handleSubmit();
    });

    expect(submitted).toBe(false);
    expect(mockLogin).not.toHaveBeenCalled();
    expect(result.current.fieldErrors.email).toBeDefined();
    expect(result.current.fieldErrors.password).toBeDefined();
  });

  it("calls SessionContext.login and onSuccess when the form is valid and login succeeds", async () => {
    mockLogin.mockResolvedValue({ ok: true });
    const onSuccess = jest.fn();
    const { result } = await renderHook(() => useLearnerLogin(onSuccess));
    await fillValidForm(result);

    let submitted: boolean | undefined;
    await act(async () => {
      submitted = await result.current.handleSubmit();
    });

    expect(submitted).toBe(true);
    expect(mockLogin).toHaveBeenCalledWith(VALID_VALUES.email, VALID_VALUES.password);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.fieldErrors).toEqual({});
    expect(result.current.formError).toBeUndefined();
  });

  it("surfaces invalid credentials as a form-level error, without calling onSuccess", async () => {
    mockLogin.mockResolvedValue({ ok: false, error: { kind: "invalid_credentials", message: "Invalid email or password." } });
    const onSuccess = jest.fn();
    const { result } = await renderHook(() => useLearnerLogin(onSuccess));
    await fillValidForm(result);

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.formError).toBe("Invalid email or password.");
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("surfaces server-side field errors (e.g. a rule the client missed)", async () => {
    mockLogin.mockResolvedValue({
      ok: false,
      error: { kind: "validation", fieldErrors: { password: "Server says this is bad" } },
    });
    const { result } = await renderHook(() => useLearnerLogin());
    await fillValidForm(result);

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.fieldErrors.password).toBe("Server says this is bad");
  });

  it("surfaces a network error as a form-level error", async () => {
    mockLogin.mockResolvedValue({
      ok: false,
      error: { kind: "network", message: "Couldn't reach the server. Check your connection and try again." },
    });
    const { result } = await renderHook(() => useLearnerLogin());
    await fillValidForm(result);

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.formError).toMatch(/couldn't reach the server/i);
  });

  it("does not leave submitting stuck true after a failure", async () => {
    mockLogin.mockResolvedValue({ ok: false, error: { kind: "server", message: "boom" } });
    const { result } = await renderHook(() => useLearnerLogin());
    await fillValidForm(result);

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.submitting).toBe(false);
  });

  it("clears a field's error as soon as it's edited", async () => {
    const { result } = await renderHook(() => useLearnerLogin());

    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.fieldErrors.email).toBeDefined();

    await act(() => {
      result.current.setField("email", VALID_VALUES.email);
    });

    expect(result.current.fieldErrors.email).toBeUndefined();
  });
});
