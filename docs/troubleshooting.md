# Troubleshooting

Quick fixes for recurring failures.

## Backend / signup

- `EXPO_PUBLIC_API_BASE_URL is not set` → add to `.env`/`.env.local`, restart server. Android emulator must use `10.0.2.2:8000`, not `127.0.0.1`; device uses LAN IP. See [getting-started](getting-started.md).
- `Couldn't reach the server` banner → backend down / wrong host / device not on same LAN.
- 422 shows field errors but form looks valid → backend added a rule client doesn't know; backend wins — update `lib/validation/learner.ts`.

## Expo / fonts / assets

- Check SDK-specific API at https://docs.expo.dev/versions/v57.0.0/ before StackOverflow fixes.
- Wrong font → name in `lib/theme.ts` must match `useFonts` key in `app/_layout.tsx`.
- Broken images → `lib/figma-assets.ts` URLs are remote; need network. Blank `expo-image` = bad URL.
- `npx expo-doctor` red → fix dep drift before anything else.

## Tests

- `result` undefined in hook test → forgot `await renderHook(...)` (v14 async).
- “Overlapping act()” → forgot `await act(...)`.
- All tests after first fail → stray `jest.resetAllMocks()` killed `jest-expo` mocks. See [testing](testing.md).

## Theme

- Light/dark looks wrong → hardcoded color; switch to `useTheme().colors`. `constants/Colors.ts` is not the theme.
