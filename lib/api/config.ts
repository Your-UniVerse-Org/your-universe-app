/** Resolves the your-universe-backend base URL from EXPO_PUBLIC_API_BASE_URL. No hardcoded
 * fallback lives in code — the value comes entirely from env files, loaded by Expo in this
 * order (later overrides earlier): `.env` (committed, shared default) then `.env.local`
 * (gitignored, personal override — see .env.example). The right host differs per environment:
 *  - iOS Simulator: http://127.0.0.1:8000 works directly.
 *  - Android Emulator: 127.0.0.1 refers to the emulator itself, not your machine — use
 *    http://10.0.2.2:8000 instead.
 *  - Expo Go on a physical device: use your machine's LAN IP, e.g. http://192.168.x.x:8000. */
export function getApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (!configured) {
    throw new Error(
      "EXPO_PUBLIC_API_BASE_URL is not set. Add it to .env (shared default) or .env.local " +
        "(personal override) — see .env.example — then restart the dev server.",
    );
  }
  return configured.endsWith("/") ? configured.slice(0, -1) : configured;
}
