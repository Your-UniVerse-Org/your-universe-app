# Getting started

How to install, configure, and run `your-universe-app` on simulator/emulator/device/web.

## Prerequisites

- Node.js 20 LTS+, npm
- Expo Go on phone (easiest), and/or Xcode (iOS sim, macOS only) / Android Studio (emulator)
- Backend running for signup: `your-universe-backend` on `:8000` (only `POST /learners` is used so far)

## Install & run

```bash
npm install
npm start          # opens Expo Dev Tools; scan QR with Expo Go
npm run ios        # iOS Simulator
npm run android    # Android emulator
npm run web        # browser (metro static)
npm test           # jest single run
npm run test:watch # watch mode
```

Type-check / health before PRs:

```bash
npx tsc --noEmit
npx expo-doctor
npm test
```

## Env: API base URL

Read by `lib/api/config.ts` → `getApiBaseUrl()`. No hardcoded fallback — throws if unset.

| File | Purpose |
|---|---|
| `.env` | Committed shared default (`EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000`) |
| `.env.local` | Gitignored personal override, wins over `.env` |
| `.env.example` | Template to copy |

Set per platform:

- iOS Sim / web: `http://127.0.0.1:8000`
- Android emulator: `http://10.0.2.2:8000` (`127.0.0.1` = emulator itself)
- Physical device (Expo Go): `http://<your-LAN-IP>:8000`

After changing env, restart dev server. See [api-client](api-client.md).

## Fonts / splash

Fonts load in `app/_layout.tsx` via `useFonts` (Inter 400/500/600/700, SpaceGrotesk 600/700, InstrumentSerif regular+italic). `SplashScreen.preventAutoHideAsync()` until loaded, then custom `LoadingScreen` overlay (~2800ms). If text looks wrong, check font names in `lib/theme.ts` → `fonts`.

## Related

- [overview](overview.md) · [architecture](architecture.md) · [troubleshooting](troubleshooting.md) · [testing](testing.md)
