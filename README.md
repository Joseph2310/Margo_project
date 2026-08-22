# Beneficiaries application

Arabic RTL React Native application with a FastAPI/PostgreSQL backend. The API and mobile flows implement the supplied Beneficiaries design: authentication, beneficiary profile and points, readings and events, question activities, retreat/reflection, conversations, suggestions, and notifications.

## Architecture

### Backend

- FastAPI with generated OpenAPI, Swagger UI, ReDoc, and a consistent JSON error model
- PostgreSQL 16, SQLAlchemy 2, Alembic migrations, and development seed data
- JWT access tokens plus rotating/revocable refresh tokens
- Argon2 password hashing, expiring verification codes, reset tokens, and attempt limits
- Server-owned points, attendance QR values, submission status, and duplicate-award rules
- Configurable SMTP delivery for registration and password-reset codes
- Docker Compose services for the database, API, backend integration tests, and frontend checks

The API is grouped under `/api/v1`:

- `/auth`: registration, verification, login, refresh, logout, and password recovery/change
- `/profile`: beneficiary profile and WhatsApp community link
- `/home`, `/events`, `/readings`: home feed and content
- `/questions`: categories, questions, proposed questions, and `Know Me`
- `/retreat`: activities, submissions, reflection, and server-awarded points
- `/conversations`: private servant conversations, the shared beneficiary house
  room, persisted messages, read receipts, blocking, and deletion
- `/suggestions`: general suggestions and hymn ratings
- `/notifications`: list, mark one read, or mark all read

The exact request/response models and error responses are the generated OpenAPI contract.

### Frontend

- `src/api/`: Axios configuration, bearer injection, refresh-token rotation, retry, and normalized errors
- `src/services/`: typed calls grouped by backend API domain
- `src/providers/`: TanStack Query hooks/mutations and authentication provider behavior
- `src/types/`: TypeScript request/response models matching FastAPI's camel-case JSON models
- `src/screens/` and `src/components/`: consume provider hooks; they do not call the API directly
- `src/store/`: persisted authentication/UI state only; server data remains in TanStack Query

In development, the API host is derived from Metro's script URL. This lets an emulator or physical device use the computer running Metro and Docker without hard-coding an address. Production builds must replace `PRODUCTION_API_BASE_URL` in `src/config/environment.ts` or set `global.__API_BASE_URL__` before the bundle is evaluated.

### Real-time chat contract

The mobile app connects to `ws://<api-host>:8000/api/v1/conversations/ws` (or
`wss://` in production), then immediately sends:

```json
{ "type": "authenticate", "accessToken": "<JWT access token>" }
```

The server emits `chat.connected`, `message.created`, `message.status`,
`chat.error`, and `pong` events. Message creation remains an authenticated
`POST /api/v1/conversations/messages`; this guarantees that authorization,
validation, and persistence finish before an event is published. The app
reconnects with bounded exponential backoff and refetches conversation history
after reconnecting, so events missed while offline are recovered.

The development service runs one Uvicorn worker, matching the in-process socket
connection manager. A multi-worker or multi-instance deployment must put a
shared pub/sub adapter (for example Redis) behind the connection manager before
increasing the worker count.

## Run locally

Requirements: Docker, Docker Compose, Node.js 22.11+, JDK 17, and the standard React Native Android/iOS environment.

```sh
cp .env.example .env
docker compose up -d --build db api
```

Development URLs:

- API health: `http://localhost:8000/health`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`
- Versioned OpenAPI snapshot: `backend/openapi.json`

Seeded development account:

- Email: `joy.barakat@hotmail.com`
- Password: `Password1`
- Verification code: `123456`

Then run the mobile app:

```sh
npm ci
npm start
npm run android
```

For a USB-connected Android phone, keep the configured development URL and run
`adb reverse tcp:8082 tcp:8082` when Metro is on port 8082, plus
`adb reverse tcp:8000 tcp:8000`. The WebSocket uses the same reversed API port.

For iOS, run `bundle install` and `bundle exec pod install` from `ios/` on macOS before `npm run ios`.

## Validation

```sh
docker compose --profile tools up --build --force-recreate backend-test
bash backend/scripts/smoke_test.sh
npm run typecheck
npm run lint
npm run format:check
npm test -- --runInBand

cd android
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 ./gradlew :app:assembleDebug
```

The debug APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`.

## Hosting configuration

All backend settings are environment variables; `.env.example` is the deployment checklist. For production:

- Set a long random `JWT_SECRET_KEY` and production `DATABASE_URL`.
- Set `APP_ENV=production`, `AUTO_SEED=false`, and `EXPOSE_VERIFICATION_CODE=false`.
- Configure `CORS_ORIGINS` as a comma-separated allowlist.
- Configure `SMTP_HOST`, port, credentials, sender, and TLS/SSL options. If codes are hidden and SMTP is absent, verification returns a documented `503` instead of silently losing the code.
- Set the optional `WHATSAPP_GROUP_URL`.
- Run `alembic upgrade head` before starting Uvicorn/Gunicorn workers.

Do not use the Compose development database password, demo account, debug signing key, or placeholder production mobile URL in a hosted release.
