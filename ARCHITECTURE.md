# Architecture Overview
This document serves as a critical, living template designed to give contributors a rapid and comprehensive understanding of the system architecture. It explains the structure, data flow, core components, business rules, and scaling considerations of the Workspace Booking & Pricing System. Update this document as the codebase evolves.

---

## 1. Project Structure
This section provides a high-level overview of the project's directory structure, organized by architectural layers. It enables quick navigation and clarifies the separation of backend and frontend responsibilities.

```text
[Project Root]/
├── backend/                      # All server-side logic (Node.js + Express)
│   ├── src/
│   │   ├── routes/               # API route definitions
│   │   ├── controllers/          # HTTP layer (status codes, API responses)
│   │   ├── services/             # Business logic (pricing, conflicts, analytics)
│   │   ├── models/               # Mongoose schemas: Room, Booking
│   │   └── utils/                # Utility helpers (errors, timezone, pricing)
│   ├── config/                   # MongoDB config and connection setup
│   ├── package.json              # Backend dependencies and scripts
├── frontend/                     # Client-side application (React + Vite)
│   ├── public/_redirects         # Netlify redirects for SPA routing
│   ├── src/
│   │   ├── components/           # UI building blocks (RoomCard, NavBar etc.)
│   │   │   └── admin/            # Admin UI modules (AnalyticsPanel, BookingsManagement, AdminHeader)
│   │   ├── pages/                # Screens (RoomsListing, BookingForm, AdminView)
│   │   ├── api/                  # API client (HTTP wrapper for backend)
│   │   ├── hooks/                # Reusable logic (useAdminAnalytics, useAdminBookings)
│   │   └── utils/                # Frontend time utils (IST formatting)
│   └── package.json              # Frontend scripts and dependencies
├── scripts/                      # Deployment/upload helpers (optional)
├── README.md                     # Project overview & quick start
└── ARCHITECTURE.md               # This document
```

---

## 2. High-Level System Diagram
[User]
|
v
[Frontend SPA (React)]
|
v
[Backend API (Express)]
|
v
[MongoDB Database]

Key interactions:

- User interacts with UI → selects room → creates booking → triggers pricing logic.
- Frontend communicates with backend via REST API.
- Backend enforces conflict detection, cancellation rules, analytics, and pricing.
- MongoDB stores Room and Booking records.

---

## 3. Core Components

### 3.1. Frontend

**Name:** Workspace Web Application  
**Description:**  
A responsive UI where users can browse rooms, create bookings, cancel bookings, and view analytics. Admins access a unified Admin View to monitor bookings and revenue trends.

**Technologies:**  
React, Vite, React Router, Tailwind CSS, lucide-react icons, react-hot-toast

**Deployment:**  
Netlify (free-tier)

---

### 3.2. Backend Services

#### 3.2.1. API Gateway & Business Logic Service

**Name:** Workspace Booking API  
**Description:**  
A monolithic but properly layered service implementing:

- Room listing
- Booking creation (with conflict prevention)
- Dynamic pricing with peak/off-peak handling
- Cancellation rules (≥2 hours before start)
- Analytics aggregation (hours + revenue per room)

**Technologies:**  
Node.js, Express.js, Mongoose (MongoDB), Intl for timezone handling

**Deployment:**  
Render (free-tier)

---

## 4. Data Stores

### 4.1. Primary Database

**Name:** craftMyPlateDatabase  
**Type:** MongoDB  

**Purpose:**  
Stores rooms, bookings, and related metadata. Ensures persistence across restarts and supports efficient queries for analytics and conflict detection.

**Key Collections:**

- `rooms`
- `bookings`  
  (Fields: roomId, userName, startTime, endTime, totalPrice, status)

---

## 5. External Integrations / APIs

None currently used.

The architecture supports future integrations such as:

- Payment gateway (Stripe)
- Email provider (SendGrid)
- SMS notifications (Twilio)

---

## 6. Deployment & Infrastructure

**Cloud Provider:**  
Netlify and Render (free-tier hosting)

**Frontend Deployment:**  
- Netlify static hosting  

**Backend Deployment:**  
- Render (Node service)  
- Auto-build triggered via GitHub Webhooks  
- Health checks: `/api/health`

**Monitoring & Logging:**  
- Render logs  
- Browser console for frontend errors  

---

## 7. Security Considerations

**Authentication:**  
None required for assignment (guest + admin same access).  
Extendable to JWT-based auth if needed.

**Authorization:**  
Not implemented (out of scope).

**Data Encryption:**  
- HTTPS enforced by hosting provider  
- TLS for all API calls  

**Security Practices:**  
- Input validation for booking creation  
- Sanitized MongoDB queries  
- Environment variables for DB connection strings

---

## 8. Development & Testing Environment

**Local Setup:**  
1. Clone repo  
2. Start MongoDB  
3. Run backend (`npm start`)  
4. Run frontend (`npm run dev`)


**Code Quality Tools:**  
- ESLint (backend + frontend)  
- Prettier for formatting

---

## 9. Future Considerations / Roadmap

- Add authentication (JWT + role-based access)
- Introduce Redis caching for analytics
- Implement WebSockets for live booking updates
- Migrate pricing logic to a dedicated microservice (if scaling)
- Add rate limiting for public endpoints
- Move from minute-level iteration to time-window batching for performance

---

## 10. Project Identification

**Project Name:** Workspace Booking & Pricing System  
**Repository URL:** https://github.com/JatinSc/Workspace_Booking_Pricing_System
**Primary Contact:** Jatin (Full Stack Developer)  
**Date of Last Update:** 2025-11-18

---

## 11. Glossary / Acronyms

**SPA** — Single Page Application  
**IST** — Indian Standard Time (UTC+5:30)  
**CRUD** — Create, Read, Update, Delete  
**API** — Application Programming Interface  
**CI/CD** — Continuous Integration / Continuous Deployment  
**Peak Hours** — Business-defined high-demand windows (10–12:59 & 16–18:59)  
**Conflict** — Overlapping bookings on same room  
**Analytics** — Aggregation of total hours + revenue per room  

---

## 12. Conflict Detection Logic (Formal Rule)

**Goal:** Prevent overlapping bookings on the same room.

**Formal Rule:** A new booking for `roomId` with window `[startTime, endTime)` conflicts with an existing confirmed booking if:

```
existing.roomId == new.roomId
AND existing.status == 'CONFIRMED'
AND existing.startTime < new.endTime
AND existing.endTime > new.startTime
```

This treats intervals as half-open (`end` is exclusive), avoiding false conflicts where one booking ends exactly when the next begins.

**MongoDB Query (models/bookingModel.findOverlap):**
```js
return Booking.findOne({
  roomId,
  status: 'CONFIRMED',
  startTime: { $lt: new Date(endISO) },
  endTime:   { $gt: new Date(startISO) }
}).sort({ startTime: 1 }).lean();
```

**Controller Message:** On conflict, the API returns a human-readable window using business timezone formatting (e.g., "Room already booked from 5:30 PM to 6:30 PM").

---

## 13. Pricing Method (Per‑Minute Algorithm)

**Purpose:** Compute dynamic price with peak multipliers applied minute-by-minute for accuracy.

**Business Rules:**
- Base rate per hour: `room.baseHourlyRate`.
- Peak windows (Mon–Fri): `10:00–12:59` and `16:00–18:59` in `BUSINESS_TZ`.
- Peak multiplier: `1.5×` during peak minutes.

**Algorithm (pseudo-code):**
```pseudo
function computeDynamicPrice(start, end, baseRate, tz):
  s = Date(start)
  e = Date(end)
  total = 0
  for t from s to e step 1 minute:
    isPeakMinute = isPeak(new Date(t), tz)
    ratePerMinute = (isPeakMinute ? baseRate * 1.5 : baseRate) / 60
    total += ratePerMinute
  return roundToTwoDecimals(total)
```

**Round-to-2-decimals:**
```js
Math.round(total * 100) / 100
```

**Notes:**
- Iterating per minute ensures accurate application of peak windows across partial hours.
- Consider future optimization (batching contiguous windows) if performance requirements increase.

---

## 14. AI Usage Notes

**Scope of AI Assistance:**
- ChatGpt for Code Review and Refactoring.
- Bolt.AI for Basic UI Creation and Componentization.
- Documentation structuring, code organization suggestions, and refactor planning.
- Pair-programming support for routing changes and UI enhancements.