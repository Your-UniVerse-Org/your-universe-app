# your-universe-app

The Your Universe mobile app, built with [Expo](https://expo.dev/) + [Expo Router](https://docs.expo.dev/router/introduction/), React Native, and TypeScript.

## Tech stack

- **Expo SDK 57** / React Native 0.86 / React 19
- **Expo Router** for file-based navigation (see `app/`)
- **TypeScript** (strict mode)
- **react-native-reanimated** for animations, **react-native-svg** for vector graphics

> [!IMPORTANT]
> This project tracks a very recent Expo SDK release. Before writing code that touches
> navigation, config, or any Expo API, check the versioned docs for this exact SDK at
> https://docs.expo.dev/versions/v57.0.0/ — APIs may differ from older tutorials/blog posts
> you're used to. See `AGENTS.md` for the full note.

## Prerequisites

- [Node.js](https://nodejs.org/) 20 LTS or newer
- npm (ships with Node)
- The [Expo Go](https://expo.dev/go) app on your phone (easiest way to run on a real device), and/or:
  - **iOS**: Xcode + iOS Simulator (macOS only)
  - **Android**: Android Studio + an Android emulator

## Getting started

1. **Clone the repo**

   ```bash
   git clone https://github.com/Your-UniVerse-Org/your-universe-app.git
   cd your-universe-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the dev server**

   ```bash
   npm start
   ```

   This opens Expo Dev Tools in your terminal. From there:
   - Scan the QR code with the Expo Go app on your phone, or
   - Press `i` to open the iOS Simulator, `a` for the Android emulator, or `w` for web

   Alternatively, run a platform directly:

   ```bash
   npm run ios      # iOS Simulator
   npm run android  # Android emulator
   npm run web      # Web browser
   ```

## Project structure

```
your-universe-app/
├── app/            # Screens and layouts (Expo Router file-based routing)
│   ├── (auth)/     # Auth flow routes
│   ├── (tabs)/     # Main tab-bar routes
│   └── _layout.tsx # Root layout
├── components/     # Reusable UI components
├── constants/      # Shared constants (colors, etc.)
├── lib/            # App logic/utilities not tied to a specific component
├── __tests__/      # Jest tests, mirroring the lib/ (etc.) structure they cover
├── assets/         # Fonts and images
├── docs/           # Wiki-style project documentation (see docs/README.md)
├── app.json        # Expo app config
└── tsconfig.json   # TypeScript config
```

## Testing

Non-UI logic (`lib/`) has Jest unit tests under `__tests__/`, using the `jest-expo` preset and
`@testing-library/react-native` (for hooks). Run them with:

```bash
npm test          # single run
npm run test:watch
```

Screens/components themselves are still verified manually (see below) — the test suite covers
the logic they depend on (API calls, validation, form state), not screen rendering.

## Development rules

- **Read the current Expo docs first.** This app tracks a bleeding-edge SDK version — don't
  assume older Expo/React Native patterns still apply. Check
  https://docs.expo.dev/versions/v57.0.0/ before implementing anything Expo-API-related.
- **TypeScript strict mode is on.** Don't use `any` to silence errors — fix the underlying type
  issue. Use the `@/*` path alias (configured in `tsconfig.json`) instead of long relative
  imports.
- **Follow existing patterns.** New screens go under `app/` following the existing route group
  structure; shared UI goes in `components/`; non-UI logic goes in `lib/`.
- **Theming.** Use `components/ThemeContext.tsx` / `components/Themed.tsx` and
  `constants/Colors.ts` rather than hardcoding colors, so light/dark mode keeps working.
- **Keep secrets out of the repo.** Any environment-specific values must go through
  `EXPO_PUBLIC_*` env vars in a local `.env.local` file (already gitignored) — never commit
  secrets or API keys.
- **Document as you go.** Any new feature, screen, or non-obvious pattern gets a page in
  `docs/` (see `docs/README.md`).

## Branching and pull request workflow

The `main` branch is protected and always deployable. All work happens on branches off of
`main`, merged in through pull requests.

1. **Sync `main` and create a branch**

   ```bash
   git checkout main
   git pull origin main
   git checkout -b <type>/<short-description>
   ```

   Use a branch prefix that matches the kind of change, e.g.:
   - `feature/add-friends-list`
   - `fix/onboarding-crash-on-android`
   - `chore/bump-expo-sdk`
   - `docs/theming-guide`

2. **Make your changes**

   Keep commits focused and write clear commit messages describing *why* the change was made.

3. **Verify your change**

   Before opening a PR, run locally:

   ```bash
   npx tsc --noEmit     # type check
   npx expo-doctor      # validate Expo project health/dependencies
   npm test             # run the Jest suite
   ```

   Also manually test the change on at least one platform (iOS, Android, or web) via the dev
   server — screens/components aren't covered by automated tests yet, only the logic under
   `lib/`, so manual verification of any UI change is still required.

4. **Add documentation**

   Every PR that adds or changes a feature, screen, or non-obvious behavior must include a
   corresponding page (or update) in `docs/`.

5. **Push your branch and open a PR**

   ```bash
   git push -u origin <type>/<short-description>
   ```

   Open a pull request targeting `main`. The PR description must include:
   - **What** changed and **why**
   - **How to test** the change (steps to reproduce/verify, plus which platform(s) you tested on)
   - **Screenshots or a short screen recording** for any UI change
   - Links to any related issues/tickets

   > [!WARNING]
   > PRs without documentation, and without evidence the change was tested, will not be merged.

6. **CI checks**

   Opening or updating a PR automatically triggers the `PR Checks` GitHub Actions workflow
   (`.github/workflows/pr-checks.yml`), which installs dependencies, type-checks the project, and
   runs `expo-doctor` to validate the Expo project's health. All checks must pass before merging.

7. **Review and merge**

   Address review feedback with additional commits on the same branch. Once approved and CI is
   green, the PR will be merged into `main`.
