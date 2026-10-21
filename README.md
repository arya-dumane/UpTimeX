# UptimeX — Website & API Uptime Monitoring SaaS

**UptimeX** is a production-minded MERN stack SaaS application designed to monitor the health, availability, and latency of websites and HTTP/HTTPS APIs in real-time.

---

## 🚀 Architecture Overview

This monorepo is structured for clean separation of concerns:

```
UpTimeX/
├── .env.example              # Documented root environment variables
├── .gitignore                # Root gitignore protecting secrets and artifacts
├── package.json              # Monorepo scripts with concurrent execution & testing
├── README.md                 # Project documentation and setup guide
│
├── backend/                  # Node.js + Express API server
│   ├── .env.example          # Backend environment template
│   ├── .gitignore            # Backend gitignore
│   ├── package.json          # Express, Mongoose, CORS, Dotenv, Tests
│   ├── scripts/
│   │   └── verifyDb.js       # Live database connection & index verification script
│   ├── test/
│   │   └── models.test.js    # Unit & schema validation tests (node:test)
│   └── src/
│       ├── config/
│       │   ├── db.js         # Mongoose connection with URI masking & error sanitization
│       │   └── env.js        # Validated environment configuration
│       ├── controllers/
│       │   ├── healthController.js   # GET /api/health controller (sanitized status)
│       │   └── monitorController.js  # CRUD & dashboard telemetry controller
│       ├── middleware/
│       │   ├── errorHandler.js       # Centralized JSON error handler
│       │   └── notFound.js           # 404 handler
│       ├── models/
│       │   ├── index.js              # Models barrel export
│       │   ├── User.js               # User accounts schema
│       │   ├── Monitor.js            # Monitored endpoints schema with URL normalization
│       │   ├── CheckResult.js        # Separate telemetry collection for latency checks
│       │   └── Incident.js           # Outage tracking with partial unique index
│       ├── routes/
│       │   ├── healthRoutes.js       # Health check router
│       │   └── monitorRoutes.js      # Monitor endpoints router
│       ├── app.js            # Express app configuration & middleware pipeline
│       └── server.js         # Server entry point with graceful shutdown
│
└── frontend/                 # React 18 + Vite + Tailwind CSS Single-Page App
    ├── .env.example          # Frontend environment template
    ├── .gitignore            # Frontend gitignore
    ├── index.html            # Dark-themed HTML shell with Inter typography
    ├── package.json          # React 18, React Router, Recharts, Lucide, Axios
    ├── postcss.config.js     # PostCSS configuration
    ├── tailwind.config.js    # Custom dark slate/navy theme tokens & glowing shadows
    ├── vite.config.js        # Vite dev server with /api proxy to port 5000
    └── src/
        ├── components/
        │   ├── common/
        │   │   ├── Badge.jsx         # Status badge (operational, down, degraded, pending, unknown)
        │   │   ├── Button.jsx        # Buttons with variants and loading spinners
        │   │   ├── Card.jsx          # Glassmorphism container cards
        │   │   ├── Input.jsx         # Accessible form inputs with error states
        │   │   ├── Modal.jsx         # Accessible modal dialog with backdrop blur
        │   │   └── StateIndicator.jsx# Loading and error state displays
        │   ├── dashboard/
        │   │   ├── AddMonitorModal.jsx   # Form modal to create new monitors
        │   │   ├── EmptyMonitorsState.jsx# Onboarding state when no monitors exist
        │   │   ├── MonitorsTable.jsx     # Telemetry data table with action controls
        │   │   ├── ResponseTimeChart.jsx # Recharts area chart with latency trends
        │   │   └── SummaryCards.jsx      # Metric cards: Total, Up, Down, Avg Latency
        │   └── layout/
        │       ├── DashboardLayout.jsx   # Main responsive layout container
        │       ├── Sidebar.jsx           # Dark navigation bar with live API badge
        │       └── Topbar.jsx            # Top actions bar with Add Monitor CTA
        ├── pages/
        │   ├── OverviewPage.jsx      # Primary dashboard with summary & charts
        │   ├── MonitorsPage.jsx      # Searchable & filterable monitors view
        │   ├── IncidentsPage.jsx     # Live outage and service disruption logs
        │   └── SettingsPage.jsx      # Telemetry diagnostics & alert previews
        ├── services/
        │   ├── api.js                # Axios client with interceptors
        │   ├── healthService.js      # API health diagnosis service
        │   └── monitorService.js     # Monitor CRUD service
        ├── App.jsx                   # React Router routing setup
        ├── index.css                 # Tailwind directives, custom glassmorphism styles
        └── main.jsx                  # React application entry point
```

---

## 🗄️ Database Architecture & Data Models (Phase 2)

### 1. Model Definitions & Relationships

```
┌──────────────┐          1:N          ┌─────────────────┐
│     User     │ ────────────────────> │     Monitor     │
└──────────────┘                       └─────────────────┘
                                                │
                                ┌───────────────┴───────────────┐
                            1:N │                           1:N │
                                v                               v
                       ┌─────────────────┐             ┌─────────────────┐
                       │   CheckResult   │             │    Incident     │
                       └─────────────────┘             └─────────────────┘
```

#### **User** (`backend/src/models/User.js`)
- **Fields:**
  - `name` (String, required, trim, min: 2, max: 100)
  - `email` (String, required, unique, lowercase, trimmed, validated via RFC-compliant regex)
  - `passwordHash` (String, required, stripped automatically from `toJSON` / `toObject` serialization)
  - `createdAt`, `updatedAt` (timestamps: true)
- **Indexes:**
  - `email_1` (unique)
- **Security Standard:** Plaintext passwords are never stored.

#### **Monitor** (`backend/src/models/Monitor.js`)
- **Fields:**
  - `name` (String, required, trimmed, max: 100)
  - `url` (String, required, trimmed, normalized setter, validated for http/https protocols)
  - `user` (ObjectId, ref: `User`, indexed for tenant ownership)
  - `checkIntervalSeconds` (Number, default: 60, min: 10, max: 86400; virtual alias `interval`)
  - `timeoutMs` (Number, default: 10000, min: 1000, max: 60000)
  - `status` (String, enum: `['pending', 'up', 'down', 'unknown']`, default: `'pending'`, indexed)
  - `lastCheckedAt` (Date, default: null)
  - `lastStatusChangeAt` (Date, default: null)
  - `isActive` (Boolean, default: true, indexed)
  - `createdAt`, `updatedAt` (timestamps: true)
- **URL Normalization:**
  - Automatically trims whitespace, forces protocol and hostname to lowercase, and strips unnecessary trailing root slashes (e.g. `HTTPS://API.MyCompany.COM/` becomes `https://api.mycompany.com`).
- **Indexes:**
  - `{ user: 1, createdAt: -1 }` (fast retrieval of user monitors)
  - `{ isActive: 1, status: 1 }` (status filtering and active monitor querying)
- **Design Rule:** Does **not** embed unlimited check history or redundant derived analytics inside the Monitor document.

#### **CheckResult** (`backend/src/models/CheckResult.js`)
- **Fields:**
  - `monitor` (ObjectId, ref: `Monitor`, required, indexed)
  - `status` (String, enum: `['up', 'down']`, required)
  - `statusCode` (Number, nullable, default: null, min: 100, max: 599)
  - `responseTimeMs` (Number, nullable, default: null, min: 0)
  - `errorMessage` (String, nullable, default: null, trimmed, max: 1000)
  - `checkedAt` (Date, default: Date.now, required)
- **Indexes:**
  - `{ monitor: 1, checkedAt: -1 }` (compound index for fast retrieval of latest check results)
  - `{ checkedAt: -1 }` (time-based index for retention cleanup and timeline analysis)

#### **Incident** (`backend/src/models/Incident.js`)
- **Fields:**
  - `monitor` (ObjectId, ref: `Monitor`, required, indexed)
  - `startedAt` (Date, default: Date.now, required)
  - `resolvedAt` (Date, default: null; validated to be `>= startedAt`)
  - `cause` (String, required, trimmed, min: 3, max: 500)
  - `status` (String, enum: `['ongoing', 'resolved']`, default: `'ongoing'`, required, indexed)
  - `createdAt`, `updatedAt` (timestamps: true)
- **Duplicate Prevention Standard:**
  - Enforces a **partial unique index**:
    ```javascript
    incidentSchema.index(
      { monitor: 1 },
      {
        unique: true,
        partialFilterExpression: { status: 'ongoing' },
        name: 'unique_ongoing_incident_per_monitor',
      }
    );
    ```
    This guarantees at the database level that **at most one ongoing incident can ever exist per monitor**, preventing duplicate open incidents during check worker execution.
- **Indexes:**
  - `unique_ongoing_incident_per_monitor` (`{ monitor: 1 }` with `{ status: 'ongoing' }` [UNIQUE] [PARTIAL])
  - `{ monitor: 1, startedAt: -1 }` (incident timeline queries)
- **Static Helpers:**
  - `Incident.findOngoing(monitorId)`: retrieves the active open incident.
  - `Incident.resolveActive(monitorId, resolvedAt)`: atomically sets status to `'resolved'` and assigns `resolvedAt`.

---

## ⚙️ MongoDB Setup & Configuration

### 1. Local MongoDB (Development)
Ensure MongoDB is running on your system (via local Windows service, Docker, or `mongod`):
```bash
# Verify local MongoDB service
mongod --version
```
In `backend/.env`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/uptimex
```

### 2. MongoDB Atlas (Cloud)
To connect to a managed MongoDB Atlas cluster:
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user with read/write access.
3. Whitelist your IP address under Network Access (`0.0.0.0/0` for development or specific IP).
4. Copy the connection string into `backend/.env`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/uptimex?retryWrites=true&w=majority
```

> **Credential Protection Standard**: UptimeX automatically masks credentials (e.g. `mongodb+srv://***:***@cluster0...`) in application logs, error traces, and API responses. Credentials or connection strings are never exposed in `/api/health` or error payloads.

---

## 🧪 Database Verification & Tests

### Verify Database Connection & Indexes
Run the automated database verification script:
```bash
# From repository root:
npm run db:verify

# Or from backend/:
cd backend
npm run db:verify
```
**Output verifies:**
- MongoDB connectivity to target URI
- Successful Mongoose compilation for `User`, `Monitor`, `CheckResult`, `Incident`
- Synchronization and active registration of all unique, compound, and partial indexes on MongoDB.
- Does not insert fake data or pollute production collections.

### Run Unit & Schema Tests
Run the automated test suite (powered by Node.js native test runner `node:test`):
```bash
# From repository root:
npm test

# Or from backend/:
cd backend
npm test
```
**Test coverage (20 passing tests):**
- URI credential masking for standard and Atlas URIs
- Error message credential sanitization
- User model validation (required fields, email regex normalization, passwordHash exclusion from JSON)
- Monitor model validation (URL normalization, scheme validation, status enum, boundary limits)
- CheckResult model validation (status enum `['up', 'down']`, nullable telemetry fields, compound index)
- Incident model validation (status enum, timestamp constraints, partial unique index)

---

## 📋 Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend Express server port | `5000` |
| `NODE_ENV` | Runtime environment (`development`, `production`, `test`) | `development` |
| `MONGODB_URI` | MongoDB connection URI (local or Atlas) | `mongodb://127.0.0.1:27017/uptimex` |
| `CLIENT_ORIGIN` | Allowed client URL for CORS | `http://localhost:5173` |
| `VITE_API_BASE_URL` | Frontend API proxy path | `/api` |

---

## 📦 Installation & Running the Application

### 1. Install Dependencies
```bash
# Install root, backend, and frontend dependencies:
npm run install:all
```

### 2. Start Both Development Servers Concurrently
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`
- **Health Check**: `http://localhost:5000/api/health`

### 3. Individual Server Commands
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend

# Frontend production build
npm run build:frontend
```

---

## 🩺 Health Endpoint Response (`GET /api/health`)

When connected:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "uptimex-api",
    "version": "1.0.0",
    "timestamp": "2026-10-21T15:37:26.104Z",
    "uptimeSeconds": 85,
    "environment": "development",
    "database": {
      "status": "connected",
      "connected": true,
      "databaseName": "uptimex",
      "readyState": "connected"
    }
  }
}
```

If MongoDB is disconnected, the server enters degraded mode and accurately reports:
```json
{
  "success": true,
  "data": {
    "status": "degraded",
    "service": "uptimex-api",
    "version": "1.0.0",
    "database": {
      "status": "disconnected",
      "connected": false,
      "readyState": "disconnected"
    }
  }
}
```
*(No passwords, internal connection strings, or sensitive credentials are ever disclosed).*
