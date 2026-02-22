# Stratizen

Stratizen is a campus collaboration platform for Strathmore University. It combines social learning, student services, and peer-to-peer tools in one React application backed by Firebase.

## Core Modules

- Authentication and onboarding
- Dashboard and user profile
- Stratizen social feed (posts, groups, clubs, reactions, comments)
- StudyHub (questions and answers)
- Marketplace
- Mentorship
- Messages
- Noticeboard
- Resource Library
- Innovation Hub
- Careers
- Timetable
- Settings and appearance preferences

## Tech Stack

- Frontend: React 19, React Router, Vite
- Styling and UI: CSS modules/files, Tailwind utilities, Framer Motion, Headless UI
- Backend services: Firebase Auth, Firestore, Firebase Storage
- Local/offline support: Dexie (IndexedDB)
- Tooling: ESLint, Prettier, Husky, lint-staged

## Project Layout

```text
.
|-- public/
|-- scripts/
|   `-- check-secrets.mjs
|-- src/
|   |-- assets/
|   |-- components/
|   |-- context/
|   |-- hooks/
|   |-- layouts/
|   |-- pages/
|   |-- services/
|   |-- styles/
|   |-- App.jsx
|   `-- main.jsx
|-- .env.example
|-- .husky/
|-- eslint.config.js
|-- firebase.json
|-- firestore.rules
|-- storage.rules
`-- package.json
```

## Local Setup

### 1. Prerequisites

- Node.js 18+ (Node 20 recommended)
- npm
- Optional for deploy/emulators: Firebase CLI (`npm i -g firebase-tools`)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Fill in all Firebase values before running the app.

### 4. Run the app

```bash
npm run dev
```

Open the local URL shown by Vite (typically `http://localhost:5173`).

## Environment Variables

| Variable                            | Required | Description                                 |
| ----------------------------------- | -------- | ------------------------------------------- |
| `VITE_FIREBASE_API_KEY`             | Yes      | Firebase web API key                        |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Yes      | Firebase auth domain                        |
| `VITE_FIREBASE_PROJECT_ID`          | Yes      | Firebase project id                         |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Yes      | Firebase storage bucket                     |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes      | Firebase messaging sender id                |
| `VITE_FIREBASE_APP_ID`              | Yes      | Firebase app id                             |
| `VITE_SOCKET_SERVER_URL`            | Optional | Socket server URL for chat/lab integrations |

If required Firebase variables are missing, the app throws an explicit startup error in `src/services/firebase.js`.

## Scripts

| Command                 | Purpose                                |
| ----------------------- | -------------------------------------- |
| `npm run dev`           | Start Vite dev server                  |
| `npm run build`         | Build production bundle                |
| `npm run preview`       | Preview production build locally       |
| `npm run lint`          | Run ESLint                             |
| `npm run format`        | Run Prettier                           |
| `npm run secrets:check` | Scan staged changes for likely secrets |

## Security and Commit Guardrails

- Secrets are not stored in source files. Use `.env` only.
- `.env*` is gitignored, while `.env.example` is tracked.
- Pre-commit hook (`.husky/pre-commit`) runs:
  1. `npm run secrets:check`
  2. `npx lint-staged`
- Secret patterns scanned include private keys, AWS keys, GitHub tokens, Slack tokens, and Firebase API key formats.

## Firebase

- Firebase config is in `firebase.json`.
- Firestore rules/indexes:
  - `firestore.rules`
  - `firestore.indexes.json`
- Storage rules:
  - `storage.rules`
- Hosting target:
  - `dist/` with SPA rewrite to `index.html`
- Local emulators are configured for Auth, Firestore, Database, Storage, and Emulator UI.

Run emulators:

```bash
firebase emulators:start
```

Deploy hosting:

```bash
npm run build
firebase deploy --only hosting
```

## Branching and Release Flow

- `main`: primary integration branch
- `release/mvp-v1`: release tracking branch
- `feature/*`: feature or fix branches

Recommended flow:

1. Branch from `main`
2. Open PR into `release/mvp-v1`
3. Run `secrets:check`, `lint`, and `build`
4. Fast-forward `main` from `release/mvp-v1` after validation

## Current Status

- `main` and `release/mvp-v1` are aligned at the same commit after latest security and cleanup work.
- Secret scanning is enforced pre-commit.

## Contact

- Maintainer: Vincent Nyamao
- GitHub: https://github.com/Vince106888
