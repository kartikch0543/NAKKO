# NAKKO Platform (Node.js & Mobile-Responsive Architecture)

A full-stack, cooperative gig platform connecting daily-wage workers with service opportunities across India. Converted from static HTML/CSS/JavaScript to a production-grade **Node.js + Express.js + EJS** application, fully responsive across mobile phones, tablets, and desktop displays.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18.x or v20.x or v22.x)
- npm

### 1. Start the Server
From the `NAKKO/divyanshu` directory:
```bash
npm start
```
Or from the project root (`Nako Project`):
```bash
npm start
```

### 2. Open in Browser
- **Homepage:** [http://localhost:3000/](http://localhost:3000/)
- **Sign In & Register:** [http://localhost:3000/login](http://localhost:3000/login)
- **User Dashboard:** [http://localhost:3000/dashboard/user](http://localhost:3000/dashboard/user)
- **Worker Dashboard:** [http://localhost:3000/dashboard/worker](http://localhost:3000/dashboard/worker)
- **Developer / Admin Portal:** [http://localhost:3000/dashboard/dev](http://localhost:3000/dashboard/dev)

*(Legacy `.html` URLs such as `/index.html`, `/login.html`, and `/dashboard-user.html` automatically redirect cleanly to their corresponding Node.js routes.)*

---

## 📱 Mobile & Web Responsiveness Highlights

The entire application was re-architected with **mobile-first responsiveness** supporting screen widths from **320px (compact phones)** to **4K monitors**:

1. **Responsive Navigation & Mobile Drawer (`views/partials/nav.ejs`)**:
   - Desktop: full horizontal links and action buttons.
   - Mobile & Tablet (`<= 768px`): animated hamburger toggle opens an accessible slide-in drawer with quick links to all platform pages and auth actions.

2. **Dashboard Mobile Drawer & Bottom Tab Bar (`views/partials/dash-mobile-nav.ejs`)**:
   - Previously, sidebars were hidden on mobile screens, blocking access to dashboard pages.
   - Now, a touch-friendly **Bottom Navigation Bar** gives 1-tap thumb access to primary sections (Home, Bookings/Jobs, Live Tracking/Active, History, Profile).
   - An off-canvas **Slide-out Sidebar Drawer** with backdrop overlay allows mobile users to access all secondary sections (Payments, Reviews, System Logs, Config).

3. **Fluid Typography & Adaptive Grids**:
   - Uses CSS `clamp()` and media query breakpoints (`1024px`, `768px`, `480px`).
   - Quick stats, service tiles, role cards, and metrics cards wrap gracefully from 4 columns to 2 columns to 1 column.

4. **Touch Ergonomics & Safe Areas**:
   - Minimum 44×44px tap targets for buttons, inputs, and toggles.
   - Support for iPhone safe areas (`env(safe-area-inset-bottom)`).
   - Prevents iOS auto-zoom by enforcing standard 16px minimum input font size.

5. **Scrollable Responsive Tables & Code Blocks**:
   - Horizontal scrolling wrappers (`.table-wrap` and `.code-block`) with custom smooth scrollbars ensure zero horizontal viewport breaking.

---

## 🏗️ Architecture & Project Structure

```
NAKKO/divyanshu/
├── server.js               # Main Express.js application & server entry point
├── package.json            # Node.js dependencies, scripts & metadata
├── README.md               # Documentation
│
├── data/
│   └── store.js            # In-memory store with realistic seed data & state methods
│
├── routes/
│   ├── authRoutes.js       # Login, registration, and session endpoints
│   ├── bookingRoutes.js    # Service catalogs and booking lifecycle endpoints
│   ├── workerRoutes.js     # Worker profiles & live availability toggle endpoints
│   └── devRoutes.js        # Telemetry metrics, system logs, & platform fee config
│
├── views/
│   ├── index.ejs           # Server-rendered homepage
│   ├── login.ejs           # Authentication & role selection (User / Worker / Dev)
│   ├── dashboard-user.ejs  # User portal: booking, live tracking, history, payments
│   ├── dashboard-worker.ejs# Worker portal: live requests, earnings, trade profile
│   ├── dashboard-dev.ejs   # Admin portal: metrics, API explorer, live logs, config
│   ├── 404.ejs             # Friendly responsive 404 error page
│   └── partials/
│       ├── head.ejs        # Shared metadata, fonts, styles
│       ├── nav.ejs         # Responsive main navigation + mobile drawer
│       ├── footer.ejs      # Responsive 4-column footer
│       ├── dash-header.ejs # Dashboard header with role badges & mobile toggle
│       └── dash-mobile-nav.ejs # Mobile bottom tab navigation bar
│
└── public/
    ├── css/
    │   ├── main.css        # Clean design tokens, typography, and base components
    │   └── responsive.css  # Dedicated mobile & tablet responsive stylesheet
    ├── js/
    │   └── main.js         # Client interaction engine, toast alerts, mobile drawer
    └── assets/
        └── favicon.svg     # SVG Brand Icon
```

---

## ⚡ REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Sign in with email, password & role |
| `POST` | `/api/auth/register` | Register new user or worker account |
| `GET` | `/api/services` | List all available gig services |
| `GET` | `/api/workers` | Get verified workers with skills & availability |
| `PATCH` | `/api/workers/:id/availability` | Toggle worker online/offline status |
| `GET` | `/api/bookings` | Retrieve user or worker service bookings |
| `POST` | `/api/bookings` | Create new service booking & allocate worker |
| `PATCH` | `/api/bookings/:id/status` | Update booking status (`in_progress`, `completed`, etc.) |
| `GET` | `/api/dev/metrics` | Real-time platform performance & uptime metrics |
| `GET` | `/api/dev/logs` | Query server logs with level filter (`INFO`, `WARN`, `ERROR`) |
| `POST` | `/api/dev/config` | Update platform fee percentage and payout cycles |

---

## 🛠️ Testing & Verification
You can run the built-in syntax and server test:
```bash
npm test
```
All routes, APIs, and templates will be verified automatically.

