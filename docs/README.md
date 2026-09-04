# Docs

This folder holds wiki-style documentation for `your-universe-app` — the "why" and "how" behind
the code that isn't obvious from reading it alone: architecture decisions, feature walkthroughs,
component/screen guides, and conventions used across the app.

## Index

Start here: [overview](overview.md) → [getting-started](getting-started.md) → [architecture](architecture.md).

- [navigation](navigation.md) — routes, layouts, how to add a screen
- [theming](theming.md) — tokens, ThemeContext, rules
- [components](components.md) — ui kit + shell + feature widgets
- [api-client](api-client.md) — config, POST /learners, errors, hook
- [learner-registration](learner-registration.md) — signup feature walkthrough
- [session](session.md) — learner login, token persistence across restarts, route guarding
- [domain-logic](domain-logic.md) — onboarding data, Universe Score, brand assets
- [testing](testing.md) — jest setup, layout, gotchas
- [conventions](conventions.md) — code rules + PR workflow
- [troubleshooting](troubleshooting.md) — quick fixes

## Adding a page

- One topic per file, named `kebab-case.md` (e.g. `onboarding-flow.md`, `theming.md`).
- Start each page with a one-paragraph summary of what it covers.
- Link related pages to each other so the docs stay navigable as they grow.
- Prefer small, focused pages over one giant catch-all doc.

## When to add a page

Any PR that introduces a new feature, screen, or non-obvious pattern should add or update a page
here alongside the code and tests (see the root [README.md](../README.md) for the full PR
checklist).
