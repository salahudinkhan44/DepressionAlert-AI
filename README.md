# DepressionAlert AI

---

## 1. Project Overview

DepressionAlert AI is a web-based intelligent mental-health monitoring system that detects
**early signs of depression** by analyzing **user-provided social-media text** using Natural
Language Processing (NLP) and Machine Learning (ML).

A registered user submits social-media posts — by **pasting text directly** or by **uploading a
CSV file** — after granting explicit data-processing consent. The system cleans and tokenizes
the text, extracts sentiment and linguistic features, and produces a **depression risk score
(0–100)** with a **risk level (Low / Moderate / High)**. Results are stored in the user's
analysis history, behavioural trends are tracked over time, and a **high-risk alert with
crisis-support resources** is raised when the score crosses the configured threshold.

The system is **strictly permission-based**: nothing is collected automatically and analysis
begins only after explicit consent, which can be revoked at any time. All outputs are
**advisory early-awareness insights only — the system is not a diagnostic or clinical tool**.

---

## 2. Project Objectives

- Provide an accessible, consent-driven tool for early awareness of depression-related
  language patterns in user-submitted text.
- Apply NLP preprocessing (cleaning, tokenization, stop-word removal) and sentiment /
  linguistic feature extraction to each submission.
- Generate a traceable depression risk score and risk level per analysis.
- Maintain rolling behavioural-pattern averages (first-person pronoun density, absolutist
  language, negative-emotion word frequency) across submissions.
- Automatically generate high-risk alerts paired with crisis-support resources.
- Guarantee per-user data isolation, secure authentication, and revocable consent.

---

## 3. Key Features

| Feature | Description |
|---|---|
| **User registration & login** | Secure account creation and JWT-based sessions |
| **Consent enforcement** | Text is processed only while consent is granted; revocable anytime |
| **Manual text submission** | Paste a post, comment, or journal entry for instant evaluation |
| **CSV batch upload** | Upload a `.csv` of posts; empty, malformed and duplicate rows are rejected |
| **Risk scoring** | 0–100 score classified as Low (<40), Moderate (40–69), High (≥70) |
| **Linguistic markers** | First-person pronoun density, absolutist language, negative-emotion words |
| **Analysis history** | Every result with date, score, level, sentiment, and source |
| **Behavioural trends** | Charts and summaries of score, sentiment and marker changes over time |
| **High-risk alerts** | Non-alarming modal + alert list; status lifecycle New → Viewed / Dismissed |
| **Crisis support** | Helplines, emergency contacts, breathing exercises, learning library |
| **Live monitor feed** | Dashboard notifications derived from the user's recent analyses |
| **Preventive actions** | Mute keywords, feed filter, scheduled nightly pause, 30-min detox timer |
| **Authorized Viewer role** | Read-only access to authorized users' results (e.g. a counselor) |
| **Privacy & profile** | Account management, password change, consent grant/revoke |

---

## 4. System Architecture

Three-tier client–server architecture:

```
┌──────────────────────────┐   REST/JSON (HTTPS)   ┌───────────────────────────────┐
│  CLIENT TIER             │ ◄──────────────────► │  APPLICATION TIER             │
│  React 18 SPA            │                       │  Node.js + Express API        │
│  Dashboard · Daily Log · │   multipart CSV      │  ├─ Auth (JWT, bcrypt)        │
│  Analysis · History ·    │ ───────────────────► │  ├─ Data Collection Module    │
│  Trends · Alerts ·       │                       │  ├─ Alert System Module       │
│  Crisis Support ·        │                       │  ├─ Behavioral Analysis Mod.  │
│  Privacy/Profile         │                       │  ├─ Dashboard aggregation     │
└──────────────────────────┘                       │  └─ ML-service client         │
                                                   └───────────┬───────────────────┘
                                                               │ protected internal API
                                                               │ (X-API-Key)
                                                   ┌───────────▼───────────────────┐
                                                   │  Python service (FastAPI)     │
                                                   │  scikit-learn · spaCy · NLTK  │
                                                   │  Groq LLM risk scorer         │
                                                   │  ├─ NLP Processing Module     │
                                                   │  └─ Depression Detection Mod. │
                                                   └───────────┬───────────────────┘
                                                               │
                                                   ┌───────────▼───────────────────┐
                                                   │  DATA TIER — MongoDB          │
                                                   │  users · posts · processedtexts│
                                                   │  · analysisresults · alerts   │
                                                   │  · behavioralpatterns         │
                                                   └───────────────────────────────┘
```

**Pipeline flow:** consent → submit text/CSV → validate & store `Post` → preprocess/extract →
`ProcessedText` → classify → `AnalysisResult` (score + level) → update `BehavioralPattern` →
if High, create `Alert` + notify → dashboard reflects the result.

### Six core modules

1. **Data Collection** — `validateAndStorePost()`: consent check, manual/CSV ingest,
   deduplication and validation, `Post` persistence.
2. **NLP Processing** — `preprocessText()`: symbol/URL removal, lowercasing, tokenization,
   stop-word removal, sentiment score, feature vector → `ProcessedText`.
3. **Depression Detection** — `computeRiskScore()`: classifier → `risk_score` (0–100) →
   `risk_level` (≥70 High, ≥40 Moderate, else Low) → `AnalysisResult`.
4. **Behavioral Analysis** — `updateBehavioralPattern()`: rolling per-user linguistic-marker
   averages → `BehavioralPattern`.
5. **Alert System** — `evaluateAndGenerateAlert()`: High risk → `Alert` (status New) +
   in-app notification.
6. **Dashboard** — aggregated view of results, trends and alerts.

---

## 5. Technologies and Tools Used

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), React Router 6, HTML, CSS, JavaScript (ES modules) |
| Backend API | Node.js (20.x LTS), Express 4 — REST + JSON |
| ML/NLP service | Python 3.11+, FastAPI, scikit-learn, spaCy, NLTK |
| Risk classifier | Groq-hosted LLM (`openai/gpt-oss-120b`, OpenAI-compatible API) with a local scikit-learn/heuristic fallback |
| Database | MongoDB (Atlas) via Mongoose 8 |
| Authentication | JWT session tokens, bcrypt salted password hashing |
| File upload | Multer (multipart/form-data, CSV only) |
| Tools | GitHub (version control), Postman (API testing) |

---

## 6. Frontend Overview

Single-page React application with a calm, card-based, responsive UI (desktop, tablet and
mobile). All protected routes require an authenticated session; a left sidebar provides
consistent navigation.

| Route | Page | Functionality |
|---|---|---|
| `/` | Landing + public pages | About, Contact, Help, Terms, Privacy Policy, Onboarding |
| `/register` | Registration | Name, email, password, explicit consent checkbox, inline validation |
| `/login` | Login | Email + password, demo-account hints, error feedback |
| `/forgot-password` `/reset-password` | Password reset | Request reset code → set new password |
| `/dashboard` | Dashboard | Digital Sentiment Score gauge, 7-day usage-vs-mood chart, mood-by-platform breakdown, preventive-action shortcuts, live sentiment-monitor feed, quick actions |
| `/daily-log` | Depression Evaluation | Paste text or upload CSV; linguistic-marker panel; Sentiment Volatility timeline; Post & Comment Deep Dive (Social Feed / Direct Messages toggle) |
| `/analysis-result`, `/analysis/:id` | Analysis Result | Risk gauge, level badge, sentiment, detected indicators, plain-language explanation |
| `/history` | Analysis History | Filterable table of all results (date, excerpt, source, sentiment, score, level) |
| `/trends` | Behavioural Trends | Risk-score and sentiment charts, marker trends, change summary |
| `/alerts` | Alerts | High-risk alert list with View result / Resources / Mark viewed / Dismiss |
| `/crisis-support` | Crisis Support | Helplines, immediate steps, coping toolkit, learning library |
| `/detox` | 30-min Detox | Guided countdown timer logged against the active alert |
| `/privacy` | Privacy & Profile | Profile edit, password change, consent grant/revoke, data-rights info |
| `/settings` | Settings | Mute Keywords, Enable Feed Filter, Schedule Nightly Pause |
| `/viewer`, `/viewer/users/:id` | Authorized Viewer | Read-only caseload: latest score, trajectory, recent results |

The **Sentiment Alert modal** appears after a high-risk submission with a non-alarming
explanation and three actions: *Take a 30-min break* (status → Viewed), *View crisis-support
resources* (→ Viewed), *Dismiss* (→ Dismissed).

The frontend communicates with the backend exclusively through `src/services/api.js`, which
attaches the JWT as a `Bearer` token and maps each function to a REST endpoint under
`VITE_API_BASE_URL`.

---

## 7. Backend Overview

Node.js/Express REST API implementing all SRS interfaces. Layered structure:
routes → middleware → controllers → services → models.

### 7.1 Middleware

| Middleware | Responsibility |
|---|---|
| `auth.middleware.js` | Verifies `Authorization: Bearer <jwt>`; rejects expired/invalid tokens; loads the user; `requireRole()` for role-gated routes |
| `consent.middleware.js` | Blocks text/CSV processing unless `consentGiven` is true — returns `403 "Consent required"` |
| `upload.middleware.js` | Multer disk storage to `uploads/`, `.csv` extension + MIME filter, size limit |
| `errorHandler.middleware.js` | `ApiError` class; consistent `{ message }` JSON errors; handles Multer/Mongoose/duplicate-key errors |

### 7.2 Services

| Service | Responsibility |
|---|---|
| `pipeline.service.js` | Orchestrates the six-module pipeline: Post → ML service → ProcessedText → AnalysisResult → BehavioralPattern → Alert |
| `mlService.service.js` | Client for the protected internal Python service (`X-API-Key`, 15 s timeout, retryable 502 on failure); single + batch analysis |
| `alert.service.js` | `evaluateAndGenerateAlert()` — creates an `Alert` (status `New`) when risk level is High |
| `behavioralAnalysis.service.js` | `updateBehavioralPattern()` — rolling per-user averages of the three linguistic markers |

### 7.3 Utilities

- `csvValidator.js` — RFC-4180-style CSV parser (quoted cells, embedded commas/newlines),
  header detection (`text`/`post`/`content`/`message` column), empty/oversized/duplicate
  row rejection (within the file and against the user's existing posts).
- `riskLevel.js` — score → level mapping (≥70 High, ≥40 Moderate, else Low).
- `serializers.js` — document → client DTOs matching the frontend's expected shapes.

### 7.4 Authentication & sessions

- Registration validates name/email/password, hashes the password with **bcrypt** (salted,
  one-way) and returns a signed **JWT** (`sub` = user id, configurable expiry).
- Login verifies credentials and issues a session token; every protected endpoint re-loads
  the user from the database so role/consent changes take effect immediately.
- Password change requires the current password; password reset issues a time-limited token
  (returned in the response in development mode, since email delivery is out of scope).

### 7.5 API reference

All endpoints are under `/api`. All except `/api/auth/*` and `/api/health` require a Bearer token.

| Method & Path | Description |
|---|---|
| `POST /api/auth/register` | Create account `{name, email, password, consent}` → `{token, user}` |
| `POST /api/auth/login` | `{email, password}` → `{token, user}` |
| `POST /api/auth/logout` | Session termination (client discards token) |
| `POST /api/auth/forgot-password` | `{email}` → issues reset token |
| `POST /api/auth/reset-password` | `{token, password}` → resets password |
| `GET /api/users/me` | Current profile |
| `PATCH /api/users/me` | Update name/email |
| `PATCH /api/users/me/password` | Change password `{current, next}` |
| `PUT /api/users/me/consent` | Grant/revoke consent `{consentGiven}` (audit-logged) |
| `GET` · `PATCH /api/users/me/settings` | Preventive-action settings (mute keywords, feed filter, nightly pause) |
| `POST /api/users/me/activity` | Log a preventive action (e.g. detox) |
| `GET /api/users/viewer/cases` | Authorized Viewer caseload *(Authorized Viewer role)* |
| `GET /api/users/viewer/cases/:id` | Read-only case detail *(Authorized Viewer role)* |
| `POST /api/submissions/text` | `{text}` → `{analysis, alert}` *(consent required)* |
| `POST /api/submissions/csv` | multipart `file` → `{results, skipped, alert}` *(consent required)* |
| `GET /api/submissions/posts` | User's stored posts (deep-dive panel) |
| `GET /api/analysis/latest` | Latest result or `null` |
| `GET /api/analysis/history` | All results, newest first |
| `GET /api/analysis/:id` | Single result detail |
| `GET /api/trends` | Points, markers, rolling averages, change summary |
| `GET /api/alerts` | User's alerts, newest first |
| `PATCH /api/alerts/:id` | `{status: New\|Viewed\|Dismissed}` |
| `GET /api/crisis-support` | Helplines, toolkit, articles |
| `GET /api/dashboard/monitor` | Live sentiment-monitor feed derived from user data |
| `GET /api/dashboard/summary` | Aggregated latest result, totals, alerts, rolling averages |

### 7.6 ML service (Python)

Protected internal FastAPI service — reachable only by the backend via `X-API-Key`.
Performs text cleaning, tokenization, stop-word removal, sentiment analysis, linguistic
feature extraction and depression-risk scoring.

| Endpoint | Description |
|---|---|
| `GET /health` | Service + model status |
| `POST /analyze` | `{text}` → cleaned text, tokens, sentiment, markers, indicators, feature vector, risk score/level, model version |
| `POST /analyze/batch` | `{texts[]}` → array of results (CSV path) |
| `POST /patterns/rolling` | `{markers[]}` → rolling averages |

**Scoring order:** Groq LLM (`openai/gpt-oss-120b`, strict-JSON response) → trained
scikit-learn artifact (`app/models/artifacts/<MODEL_VERSION>.joblib`) → deterministic
lexicon-based heuristic. The effective scorer is recorded on every `AnalysisResult` as
`modelVersion` for traceability.

---

## 8. Database / MongoDB Integration

MongoDB is accessed through Mongoose. Six collections map to the SDD data dictionary;
integer PKs map to `_id`/ObjectId references.

| Collection | Fields |
|---|---|
| `users` | `name`, `email` (unique), `passwordHash` (bcrypt, never returned), `consentGiven`, `role` (`Standard`/`Authorized Viewer`), `settings`, `consentLog`, `activityLog`, `authorizedCases`, `createdAt` |
| `posts` | `userId` → User, `content`, `source` (`Manual`/`CSV`), `kind`, `platform`, `submittedAt` |
| `processedtexts` | `postId` → Post, `userId` → User, `cleanedText`, `tokens[]`, `sentimentScore` (−1..1), `markers`, `indicators[]`, `featureVector[]` |
| `analysisresults` | `processedTextId` → ProcessedText, `postId` → Post, `userId` → User, `riskScore` (0–100), `riskLevel` (`Low`/`Moderate`/`High`), `modelVersion`, `analyzedAt` |
| `behavioralpatterns` | `userId` → User (unique), `windowStart`, `windowEnd`, `firstPersonDensity`, `absolutistLanguage`, `negativeEmotionWords`, `analysisCount` |
| `alerts` | `analysisResultId` → AnalysisResult, `userId` → User, `message`, `status` (`New`/`Viewed`/`Dismissed`), `channel`, `createdAt` |

Every query is scoped by `userId`, so users can only ever read their own data.
Uploaded CSV files are held temporarily in `uploads/` and deleted after their rows are
persisted — raw files are never retained.

---

## 9. Project Structure

```
.
├── backend/                          # Node.js/Express REST API
│   ├── package.json  .env.example
│   ├── uploads/                      # temporary CSV files (discarded after parse)
│   └── src/
│       ├── index.js                  # entry point — connect DB, start server
│       ├── app.js                    # Express app assembly
│       ├── seed.js                   # demo accounts + sample history (npm run seed)
│       ├── e2e.test.mjs              # end-to-end API verification
│       ├── config/                   # env.js, db.js
│       ├── models/                   # User, Post, ProcessedText, AnalysisResult,
│       │                             #   BehavioralPattern, Alert
│       ├── routes/                   # auth, user, submission, analysis, trend,
│       │                             #   alert, crisisSupport, dashboard
│       ├── controllers/              # one per route module
│       ├── middleware/               # auth (JWT), consent, upload (CSV), errors
│       ├── services/                 # pipeline, mlService client, alert,
│       │                             #   behavioralAnalysis
│       ├── utils/                    # csvValidator, riskLevel, serializers
│       └── data/                     # crisisResources
│
├── frontend/                         # React 18 SPA
│   ├── index.html  vite.config.js  package.json  .env.example
│   ├── public/
│   └── src/
│       ├── main.jsx  App.jsx  index.css
│       ├── routes/                   # AppRoutes, ProtectedRoute
│       ├── context/                  # AuthContext, AppDataContext, ToastContext
│       ├── services/api.js           # REST client -> backend
│       ├── components/               # layout, alerts, charts, common
│       ├── pages/                    # auth, dashboard, daily-log, analysis-result,
│       │                             #   analysis-history, behavioral-trends,
│       │                             #   alerts, crisis-support, privacy,
│       │                             #   settings, viewer, public
│       ├── utils/  hooks/  assets/
│
└── ml-service/                       # Python NLP/ML service
    ├── requirements.txt  .env.example
    ├── tests/
    └── app/
        ├── main.py                   # protected internal API
        ├── config.py
        ├── preprocessing/            # text_cleaner, tokenizer
        ├── features/                 # sentiment, linguistic_features
        ├── detection/                # groq_scorer, model_loader, risk_scorer
        ├── behavioral/               # pattern_analyzer
        └── models/artifacts/         # trained model files (MODEL_VERSION)
```

---

## 10. Environment Variables / Configuration

Copy each `.env.example` to `.env` in the same folder and fill in the values.
`.env` is git-ignored — never commit credentials.

### `backend/.env`

| Variable | Purpose | Example |
|---|---|---|
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | API port | `5000` |
| `CLIENT_URL` | Allowed frontend origin (CORS) | `http://localhost:5173` |
| `MONGODB_URI` | MongoDB connection string (local or Atlas) | `mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/depressionalert_ai` |
| `JWT_SECRET` | Session-token signing secret | *(long random string)* |
| `JWT_EXPIRES_IN` | Token lifetime | `1d` |
| `ML_SERVICE_URL` | Internal Python service URL | `http://localhost:8000` |
| `ML_SERVICE_API_KEY` | Shared key the backend presents to the ML service | *(random string)* |
| `HIGH_RISK_THRESHOLD` | Score triggering a High alert | `70` |
| `MAX_CSV_FILE_SIZE_MB` | CSV upload size limit | `5` |
| `CSV_UPLOAD_DIR` | Temporary upload directory | `uploads` |

### `frontend/.env`

| Variable | Purpose | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend REST base URL | `http://localhost:5000/api` |

### `ml-service/.env`

| Variable | Purpose | Example |
|---|---|---|
| `ML_SERVICE_PORT` | Service port | `8000` |
| `ML_SERVICE_API_KEY` | Must match the backend value | *(same random string)* |
| `MODEL_VERSION` | Model artifact identifier | `v1.0.0` |
| `GROQ_API_KEY` | Groq API key for LLM risk scoring (empty → local fallback) | `gsk_...` |
| `GROQ_MODEL` | Groq model id | `openai/gpt-oss-120b` |

---

## 11. How to Run

### Prerequisites

- **Node.js 20.x LTS** (or newer) and npm
- **Python 3.11+** with pip
- A **MongoDB** connection string — a free MongoDB Atlas M0 cluster or a local `mongod`

### 1) Configure environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ml-service/.env.example ml-service/.env
```

Then edit:

- `backend/.env` → set `MONGODB_URI` to your MongoDB cluster URL, and set `JWT_SECRET` and
  `ML_SERVICE_API_KEY` to random strings.
- `ml-service/.env` → set `ML_SERVICE_API_KEY` to the **same** value as the backend, and
  set `GROQ_API_KEY` to enable LLM scoring.
- `frontend/.env` → keep `http://localhost:5000/api` for local development.

### 2) ML service (Python)

```bash
cd ml-service
python -m venv .venv
.venv\Scripts\activate          # Windows  (source .venv/bin/activate on Linux/macOS)
pip install -r requirements.txt
uvicorn app.main:app --port 8000
```

Health check: `GET http://localhost:8000/health` → `{ "ok": true, ... }`

### 3) Backend (Node.js)

```bash
cd backend
npm install
npm run seed    # optional — creates the demo accounts and sample history
npm run dev     # http://localhost:5000/api
```

**Demo accounts** (created by `npm run seed`):

| Account | Password | Role |
|---|---|---|
| `demo@depalert.ai` | `demo1234` | Standard |
| `viewer@depalert.ai` | `viewer1234` | Authorized Viewer (authorized on the demo user) |

### 4) Frontend (React)

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
```

### 5) End-to-end API verification

```bash
cd backend
node src/e2e.test.mjs
# uses an in-memory MongoDB; to target a specific cluster:
# E2E_MONGODB_URI=<uri> node src/e2e.test.mjs
```

---

## 12. MongoDB Configuration

1. Create a free **MongoDB Atlas** M0 cluster (or run `mongod` locally).
2. Create a database user and allow your IP address in Network Access.
3. Copy the connection string and paste it into `backend/.env` as `MONGODB_URI`,
   including the database name, e.g.
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/depressionalert_ai`.
4. No collections need to be created manually — Mongoose creates them on first write.
   Run `npm run seed` to populate demo data.

> **Note:** on networks that block DNS `TXT` lookups, `mongodb+srv://` URIs fail with
> `queryTxt ETIMEOUT`. Use the equivalent standard multi-host form:
> `mongodb://<user>:<password>@host0:27017,host1:27017,host2:27017/<db>?tls=true&authSource=admin&retryWrites=true&w=majority`

---

## 13. Usage Instructions

1. Open the frontend, create an account (consent checkbox required), or log in with a
   demo account.
2. From the Dashboard choose **New Evaluation** → paste a social-media post or upload a
   CSV (one post per row; a `text`/`content`/`post` column is detected automatically).
3. View the result: risk gauge, level, sentiment, detected linguistic indicators.
4. Track **History** and **Behavioural Trends** as more evaluations accumulate.
5. A **High** result raises an alert (modal + Alerts page) with crisis-support resources —
   *Take a 30-min break* starts the detox timer; *Dismiss* closes it.
6. Manage consent, profile, password and preventive settings under **Privacy & Profile**
   and **Settings**.

---

## 14. Deployment

Each tier deploys independently; configuration is fully env-driven.

| Tier | Hosting | Notes |
|---|---|---|
| Frontend | Any static host (Vercel, Netlify, GitHub Pages) | `npm run build`; set `VITE_API_BASE_URL` to the deployed API |
| Backend | Node web service (Render, Railway, etc.) | Platform HTTPS satisfies TLS requirements; set all `backend/.env` vars |
| ML service | Python web service (Render, Railway, etc.) | Keep it private — reachable only by the backend via `ML_SERVICE_API_KEY` |
| MongoDB | Atlas M0 cluster | Connection string in `MONGODB_URI` |

---

## 15. Security Considerations

- **Authentication:** JWT session tokens; expired/invalid tokens are rejected server-side
  and cleared client-side.
- **Passwords:** bcrypt salted one-way hashing; hashes are never serialized to the client.
- **Consent enforcement:** the consent middleware blocks every text/CSV processing request
  while consent is revoked; grants and revocations are audit-logged.
- **Data isolation:** all queries are scoped to the authenticated `userId`; Authorized
  Viewers see results only for accounts on their authorized list — never raw submissions.
- **Upload safety:** `.csv` extension + MIME validation, size limit, row-level
  empty/malformed/duplicate/oversized rejection; files are deleted after parsing.
- **Transport:** HTTPS/TLS 1.2+ is provided by the hosting platform in deployment.
- **Internal API:** the Python service accepts only requests carrying the shared
  `X-API-Key`.
- **Secrets:** all credentials live in `.env` files, which are git-ignored.

---

## 16. Scope & Exclusions

The system provides supportive early-awareness insight only. It does **not** perform
clinical diagnosis, automated contact with monitored individuals, image/video analysis,
suicide-risk prediction, biometric/wearable data collection, or treatment recommendations.
Direct social-media API ingestion, clinician dashboards, admin consoles, report export and
multi-language NLP are documented as future work.

---

## 17. Conclusion

DepressionAlert AI delivers a complete, consent-based, three-tier web application:
a React SPA for submission and visualization, a Node.js/Express REST API enforcing
authentication, consent and data isolation, a protected Python NLP/ML service producing
traceable risk scores, and MongoDB persistence for users, posts, processed text, results,
behavioural patterns and alerts. Together they fulfil all functional requirements —
registration through crisis-resource alerting — while keeping the deployment footprint
simple enough to run entirely on free-tier hosting.
