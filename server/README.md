# NAKKO Backend Server API

NAKKO is a cooperative-based gig services platform engineered to connect daily-wage workers belonging to labor cooperatives with clients seeking domestic and maintenance services.

The backend is built as a **Modular Monolith** using **Node.js (ESM)**, **Express 5**, and **MongoDB / Mongoose**, implementing strict **MVC and Service Layer separation**, real cryptographically verified **JWT authentication**, **bcrypt password hashing**, and two core technical innovations designed for worker equity and high-throughput reliability.

---

## Architecture Overview

The system strictly decouples HTTP transport (Controllers and Routes) from Domain Logic (Services) and Data Storage (Models).

```
server/
├── docs/
│   ├── API_MAPPING.md                  # Complete frontend-to-backend operational mapping
│   └── API_DOCUMENTATION.md            # Exhaustive REST API specification
├── src/
│   ├── config/
│   │   ├── database.js                 # MongoDB Mongoose connection with resilient fallback
│   │   └── environment.js              # Environment variable validation & fairness weights
│   ├── core/
│   │   ├── matching/                   # INNOVATION 1: Dynamic Search Space Reduction
│   │   │   ├── availability/           # Real-time availability score calculator
│   │   │   ├── candidateFilter.js      # Stage 1: Indexed compound filter & bounding box
│   │   │   ├── geoService.js           # Stage 2: Precision geodesic routing (Haversine)
│   │   │   ├── rankingService.js       # Stage 3: Multi-factor cooperative fairness ranker
│   │   │   └── assignmentEngine.js     # Orchestrated 3-stage matching pipeline
│   │   └── transactionProtocol/        # INNOVATION 2: Atomic State Execution Protocol
│   │       ├── stateManager.js         # Directed Saga state machine & transition guards
│   │       ├── settlementService.js    # Escrow 90/5/5 cooperative split
│   │       ├── recoveryService.js      # Compensating actions, auto-reassignment & refunds
│   │       ├── validationService.js    # Idempotency key registry & payload integrity
│   │       └── auditService.js         # Immutable append-only audit trail
│   ├── integrations/
│   │   ├── payments/                   # Razorpay sandbox adapter & HMAC-SHA256 verifier
│   │   ├── maps/                       # Google Maps Distance Matrix adapter
│   │   └── welfare/                    # Simulated Government BOCW / e-Shram API adapter
│   ├── middleware/
│   │   ├── auth.middleware.js          # Bearer JWT verification (jsonwebtoken)
│   │   ├── role.middleware.js          # Role-Based Access Control (RBAC)
│   │   ├── error.middleware.js         # Centralized error and 404 handler
│   │   └── validation.middleware.js    # Request body parameter validation
│   ├── modules/
│   │   ├── auth/                       # Bcrypt hashing, token issuance, session control
│   │   ├── clients/                    # Client profiles & payment receipt histories
│   │   ├── workers/                    # Worker profiles, skills, availability toggle, earnings
│   │   ├── cooperatives/               # Cooperative entities, rosters & welfare fund pool
│   │   ├── serviceRequests/            # Booking lifecycle, dispatch & tracking steps
│   │   ├── payments/                   # Order creation & escrow deposit confirmation
│   │   └── admin/                      # Platform metrics, telemetry, and log stream
│   ├── shared/
│   │   ├── constants/                  # Roles, service status, and transaction states
│   │   └── errors/                     # AppError, UnauthorizedError, ConflictError, etc.
│   ├── app.js                          # Express application with CORS & logging
│   └── server.js                       # Server entrypoint listening on port 5000
├── tests/
│   ├── unit/
│   │   ├── auth.test.js                # Bcrypt verification & JWT claims
│   │   ├── matching.test.js            # Availability, Haversine, and fairness ranking
│   │   └── transactionProtocol.test.js # State transitions, 90/5/5 split, refunds & audit
│   ├── integration/
│   │   └── api.test.js                 # Complete API endpoint test suite
│   └── matching/
│       └── benchmark.test.js           # 2,500-worker comparative performance benchmark
├── .env.example
├── .gitignore
└── package.json
```

---

## Core Technical Innovations

### 1. Dynamic Search Space Reduction (Core Innovation 1)
Conventional gig matching systems perform expensive trigonometric geodesic distance calculations across an entire database of workers. NAKKO prunes the search space in stages before calculating road routes:

1. **Stage 1 — Indexed Candidate Filtering (`candidateFilter.js`):**
   Uses MongoDB compound indexes (`skills`, `isAvailable: true`, `kycStatus: 'verified'`) inside a coarse coordinate bounding box. Prunes over 99% of non-viable workers in sub-millisecond time.
2. **Stage 2 — Geospatial Precision (`geoService.js`):**
   Calculates high-precision geodesic distances (Haversine formula & Google Maps Distance Matrix) **only for the top shortlisted candidates** (capped at 10).
3. **Stage 3 — Multi-Factor Cooperative Fairness Ranking (`rankingService.js`):**
   Computes a balanced fairness composite score rather than defaulting to "nearest worker always wins":
   $$\text{Score} = w_{\text{prox}} \cdot S_{\text{proximity}} + w_{\text{workload}} \cdot S_{\text{workload}} + w_{\text{rating}} \cdot S_{\text{rating}} + w_{\text{coop}} \cdot S_{\text{coop}}$$
   - **Workload Equalization ($w_{\text{workload}} = 0.30$):** Gives higher priority to cooperative workers with fewer recent jobs, distributing income fairly among cooperative members.
   - **Proximity ($w_{\text{prox}} = 0.40$):** Inversely proportional to travel distance.
   - **Rating ($w_{\text{rating}} = 0.15$):** Normalized from 1.0 to 5.0.
   - **Cooperative Membership ($w_{\text{coop}} = 0.15$):** Verified cooperative members receive full score.

#### Benchmark Results (`server/tests/matching/benchmark.test.js`)
Tested across a synthetic NCR worker population of **2,500 workers**:
- **Naive Full-Space Calculations:** 2,500 geodesic route calculations (3.67 ms)
- **NAKKO Dynamic Search Space Reduction:** 10 geodesic route calculations (0.98 ms)
- **Workload Reduction:** **99.60% reduction in expensive route computations**

---

### 2. Tamper-Proof Atomic State Execution Protocol (Core Innovation 2)
Multi-party actions spanning MongoDB, client browsers, external payment gateways, and government registries cannot participate in a single ACID database transaction. NAKKO coordinates them through a **Saga-style state orchestrator**:

- **Strict State Graph:**
  `INITIATED` $\rightarrow$ `ESCROW_HOLD` $\rightarrow$ `MATCHED` $\rightarrow$ `ACCEPTED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED` $\rightarrow$ `SETTLED` (or `REFUNDED` / `FAILED`).
- **Cooperative Collective Welfare Settlement (`settlementService.js`):**
  When a job is completed, escrow funds are automatically split:
  - **90%:** Worker Net Payout
  - **5%:** Cooperative Collective Welfare Fund Pool (credited to the worker's cooperative registry)
  - **5%:** Platform Maintenance Fee
- **Compensating Actions & Recovery (`recoveryService.js`):**
  - If a worker declines, the booking auto-reallocates to the runner-up candidate without re-charging the client.
  - If cancelled before fulfillment, an automated refund transition moves state to `REFUNDED`.
- **Immutable Audit Trail (`auditService.js`):**
  Every state transition, actor identity, and payload delta is recorded in an append-only audit ledger accessible via `/api/dev/logs`.

---

## Getting Started

### Prerequisites
- **Node.js:** v20.0.0 or higher (v24.x recommended)
- **npm:** v10.x or higher
- **MongoDB:** v6.x or higher (optional for local dev; built-in resilient in-memory fallback handles offline testing)

### Installation
From the root repository or inside `server/`:

```bash
cd server
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Key environment variables:
| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `5000` | Port for the Express backend server |
| `NODE_ENV` | `development` | Runtime environment (`development` / `production`) |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/nakko` | MongoDB connection URI |
| `JWT_SECRET` | *(configured in .env)* | Secret key for signing and verifying JWT tokens |
| `JWT_EXPIRES_IN` | `7d` | Token expiration duration |
| `MAX_SEARCH_RADIUS_KM` | `15` | Maximum worker search radius |
| `RAZORPAY_KEY_ID` | `rzp_test_nakko_mock_key_id` | Razorpay sandbox API key |
| `RAZORPAY_KEY_SECRET` | `rzp_test_nakko_mock_secret` | Razorpay webhook / HMAC secret |

### Running the Server

#### Development Mode (with nodemon auto-reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

Once running, verify connectivity via the health check endpoint:
```bash
curl http://localhost:5000/api/health
```

---

## API Reference Summary

All endpoints return the unified JSON envelope:
```json
{ "success": true, "message": "...", "data": {} }
```

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | None | Register new Client or Worker account |
| `POST` | `/api/auth/login` | None | Authenticate with email and bcrypt password |
| `GET` | `/api/auth/me` | Bearer | Retrieve profile of authenticated user |
| `POST` | `/api/auth/change-password` | Bearer | Update password with old password verification |
| `POST` | `/api/auth/logout` | None | Session clearance confirmation |

### Workers (`/api/workers`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/workers` | None | List workers with `skill` and `availableOnly` filters |
| `GET` | `/api/workers/:id` | None | Get detailed worker profile |
| `PATCH` | `/api/workers/:id/availability` | Bearer | Toggle worker availability (Online / Offline) |
| `PATCH` | `/api/workers/:id/kyc` | Admin | Update worker KYC verification status |
| `GET` | `/api/workers/:id/earnings` | Bearer | View daily, monthly, and total earnings |

### Bookings / Service Requests (`/api/bookings`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/bookings` | Optional | List bookings with role/status filters |
| `POST` | `/api/bookings` | Optional | Create booking with automated worker matching |
| `GET` | `/api/bookings/:id` | None | Single booking tracking details & worker info |
| `PATCH` | `/api/bookings/:id/status` | Optional | Update booking state (`assigned`, `accepted`, `completed`) |
| `PATCH` | `/api/bookings/:id/decline` | Bearer | Decline job and trigger runner-up worker reallocation |

### Cooperatives (`/api/cooperatives`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/cooperatives` | None | List registered daily-wage worker cooperatives |
| `GET` | `/api/cooperatives/:id` | None | View cooperative profile & collective welfare balance |

### Payments & Escrow (`/api/payments`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/payments/create-order` | Optional | Create Razorpay sandbox payment order |
| `POST` | `/api/payments/verify` | Optional | Cryptographically verify HMAC signature |
| `POST` | `/api/payments/webhook` | None | Secure webhook processor with signature check |

### Government Welfare Demonstration (`/api/welfare`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/welfare/worker/:id` | None | Simulated BOCW / e-Shram worker social security check |

### Admin & Telemetry (`/api/dev`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/dev/metrics` | None | Real-time system performance & booking stats |
| `GET` | `/api/dev/logs` | None | Immutable audit log stream |
| `GET` | `/api/dev/config` | None | View platform weights & commission rules |
| `POST` | `/api/dev/config` | None | Dynamically update platform configuration |

For detailed request/response schemas and examples, refer to [`docs/API_DOCUMENTATION.md`](./docs/API_DOCUMENTATION.md).

---

## Testing & Quality Assurance

The test suite runs using the native Node.js test runner (`node:test` and `node:assert`):

```bash
npm test
```

### Test Coverage
- **`tests/unit/auth.test.js`:** Bcrypt password hashing, verification, JWT signing & claims validation.
- **`tests/unit/matching.test.js`:** Availability scoring, CandidateFilter bounding box, Haversine accuracy, workload balancing over pure proximity.
- **`tests/unit/transactionProtocol.test.js`:** StateManager DAG validation, illegal state rejection, 90/5/5 cooperative settlement split, compensating refunds.
- **`tests/integration/api.test.js`:** End-to-end HTTP integration tests covering all critical API endpoints.
- **`tests/matching/benchmark.test.js`:** Performance benchmark validating 99.60% reduction in geodesic route calculations.

**Current Result:** **20 passed, 0 failed across 5 suites (100% pass rate).**

