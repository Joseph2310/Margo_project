# تطبيق المخدومين

React Native CLI + TypeScript implementation of the Beneficiaries application represented by the supplied `Extracted_figma` package. This project intentionally contains no Servants / Service Providers application.

## Implemented scope

- Registration, six-digit verification, login, biometric entry UI, password recovery, and password change
- Arabic RTL five-tab shell: `الرئيسية`, `الخلوة`, `البيت`, `البروفايل`, `المزيد`
- Home, daily reading, upcoming events, `تعرفيني؟`, question bank, and proposed questions
- `الخلوة`, spiritual activity checklist, and `الريفلكشن`
- Servant conversations, named/anonymous identity, and text/image/voice composer affordances
- Suggestions, hymn rating, profile editing, points, attendance QR, WhatsApp entry, notifications entry, and logout

## Architecture

The code uses the requested layer-based structure under `src/`:

- `api/`: Axios client configuration only; no unknown URL is assumed
- `services/`: typed backend integration boundaries
- `hooks/`: reusable behavior and TanStack Query adapters
- `screens/`: screen composition
- `components/`: shared UI patterns
- `navigation/`: root stack and bottom tabs
- `providers/`: Redux, Query, safe-area, and gesture providers
- `store/`: Redux Toolkit client state with MMKV persistence
- `theme/`: centralized Figma-derived tokens
- `constants/`: design fixtures and confirmed business terminology
- `types/` and `utils/`: shared contracts and helpers

## Backend integration status

Swagger/API contracts were not supplied. The app therefore uses typed design fixtures through TanStack Query, makes no network requests, and does not invent endpoints, approval states, point calculations, or attendance-validation rules. Replace the preview query functions with implementations of the interfaces in `src/services/` after the backend contract is confirmed.

## Local setup

Requires Node.js 22.11+ and the standard React Native Android/iOS environment.

```sh
npm ci
npm start
npm run android
```

For iOS, run `bundle install` and `bundle exec pod install` from `ios/` on macOS before `npm run ios`.

## Validation

```sh
npm run typecheck
npm run lint
npm run format:check
npm test -- --runInBand
npx react-native bundle --platform android --dev false --entry-file index.js \
  --bundle-output /tmp/beneficiaries.android.bundle \
  --assets-dest /tmp/beneficiaries-assets
```

## Design-source limitations

The package contains screen exports, one Figma PDF, a splash image, and tick-circle SVGs. It does not contain the original font files, event artwork, profile photo, church background image, app logo, Figma prototype links, or backend contracts. Where those original assets are unavailable, the implementation uses design-token-matched shapes and icons without introducing new business behavior.
