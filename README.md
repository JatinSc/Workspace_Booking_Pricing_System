# Workspace Booking & Pricing System

A full-stack mini system that allows users to browse rooms, create bookings, cancel bookings, and view admin analytics — with real-world rules like dynamic pricing, conflict prevention, cancellation policies, and timezone-accurate calculations.

This project closely follows clean architecture principles with separate layers for
routes → controllers → services → models → utils.

---

## 🚀 Live Deployment

| Component  | URL |
|-----------|-----|
| **Frontend** | https://yourname-workspace.netlify.app/ |
| **Backend** | https://booking-system-backend-j1c9.onrender.com |

---

# 📦 How to Run Locally

### **1. Clone Repository**
```bash
git clone https://github.com/JatinSc/Workspace_Booking_Pricing_System.git
cd Workspace_Booking_Pricing_System

🖥 Backend Setup
Install Dependencies
cd backend
npm install

Environment Variables
Create backend/.env:
PORT=3001 || any other port number
MongoURL= your mongodb connection string
BUSINESS_TZ=Asia/Kolkata

Start Backend
npm start
Backend runs at:
👉 http://localhost:3001/api
health check:
👉 http://localhost:3001/api/health



🎨 Frontend Setup
Install Dependencies
cd frontend
npm install

Environment Variables
Create frontend/.env:

VITE_API_BASE_URL= http://localhost:3001/api || your backend deployed url

Start Frontend
npm run dev

Frontend runs at:
👉 http://localhost:5173


Backend API Samples
✔ Health Check
GET /api/health
→ { "ok": true }

✔ List Rooms
GET /api/rooms
Response:[
  {
    "roomId": "101",
    "name": "Cabin 1",
    "capacity": 4,
    "baseHourlyRate": 200
  }]

✔ Create Booking
POST /api/bookings/create
Request: {
  "roomId": "101",
  "userName": "Alice",
  "startTime": "2025-11-20T10:00:00+05:30",
  "endTime": "2025-11-20T12:30:00+05:30" }

Success: { "id": "655fae12ef98e", "roomId": "101", "userName": "Alice", "totalPrice": 412.5, "status": "CONFIRMED" }

Conflict: { "error": "Room already booked from 5:30 PM to 6:30 PM" }
Validation: { "error": "Start time must be before end time" }

✔ Cancel Booking
POST /api/bookings/:id/cancel
Request: { "id": "655fae12ef98e" }
Success: { "status": "CANCELED" }


Errors: { "error": "Booking already canceled" } OR { "error": "Cannot cancel within 2 hours of start time" }

✔ List All Bookings
GET /api/bookings

✔ Analytics
GET /api/analytics?from=2025-11-01&to=2025-11-30
Response: [ {"roomId": "101", "roomName": "Cabin 1", "totalHours": 12.5, "totalRevenue": 250.0 }
 ]

🧠 Dynamic Pricing Rules
Base pricing = baseHourlyRate
Peak hours (Mon–Fri): 10:00–12:59 AND 16:00–18:59
Peak multiplier = 1.5×
Pricing is computed per minute for accuracy.
Total = sum(price_per_minute) across all minutes.

📆 Cancellation Policy
A confirmed booking can be canceled only if current time is more than 2 hours before its startTime.
Otherwise → 400 Bad Request
Canceled bookings do not appear in analytics.

⏱ Time Zone Notes
All backend and frontend use:
Asia/Kolkata (IST)
Frontend sends ISO timestamps with +05:30 offset to ensure backend consistency.




**Backend Overview**
- Express + Node.js API backed by MongoDB (via `mongoose`).
- Clean layering: `routes` → `controllers` → `services` → `models` + `utils`.
- Bootstraps DB connection, seeds default rooms if none exist, and exposes REST endpoints used by the frontend.

**Entry Point**
- `backend/src/server.js`
- Responsibilities:
  - Loads env (`dotenv/config`), sets up `cors` and JSON parsing.
  - Connects to Mongo (`backend/src/config/db.js`) before starting.
  - Seeds default rooms if the collection is empty.
  - Wires routers: `rooms`, `bookings`, `analytics` under `/api/*`.
- Endpoints registered:
  - `GET /api/health` → `{ ok: true }` for liveness.

**Environment Variables**
- `PORT`: API server port. Default `3001`.
- `MongoURL`: Mongo connection string. Defaults to `mongodb://localhost:27017/workspaceBooking`.
- `BUSINESS_TZ`: Business timezone for pricing and analytics. Default `Asia/Kolkata`.

**Directory Structure (Backend)**
- `config/db.js`: Creates a single `mongoose` connection (`connectPromise`).
- `routes/*`: HTTP route declarations bound to controllers.
- `controllers/*`: HTTP-layer logic (status codes, payload shape, error mapping).
- `services/*`: Business rules and orchestration; uses models and utils.
- `models/*`: Mongoose schemas and data access helpers.
- `utils/*`: Reusable helpers (errors, date handling, pricing, time formatting).

**Data Models**
- `models/roomModel.js`
  - `Room` schema: `{ roomId: String (unique), name: String, baseHourlyRate: Number >= 0, capacity: Number >= 1 }` with timestamps.
  - Helpers:
    - `getAllRooms()` → sorted list for UI.
    - `getRoomByRoomId(roomId)` → single room lookup.
    - `seedRooms(rooms)` → bulk upsert of provided rooms.
- `models/bookingModel.js`
  - `Booking` schema: `{ roomId: String, userName: String, startTime: Date, endTime: Date, totalPrice: Number, status: 'CONFIRMED'|'CANCELED' }`.
  - Helpers:
    - `createBooking({...})` → saves and returns lean booking.
    - `getBookingById(id)`
    - `listBookings()` → admin listing (newest first).
    - `listConfirmedBetween(fromISO, toISO)` → confirmed bookings within range for analytics.
    - `findOverlap(roomId, startISO, endISO)` → overlap detection for booking conflicts.
    - `cancelBooking(id)` → sets status to `CANCELED`.

**Utilities (Helpers)**
- `utils/errors.js`
  - `serviceError(code, message)` → builds an `Error` with a `.code` used for controller mapping.
- `utils/dateUtils.js`
  - `parseISO(iso)` → robust parse with validation.
  - `startOfDayISO(dateStr, tz)` / `endOfDayISO(dateStr, tz)` → compute timezone-accurate day bounds for analytics.
- `utils/pricingUtils.js`
  - `isPeak(date, tz)` → business-defined peak windows (Mon–Fri; 10:00–12:59 and 16:00–18:59).
  - `computeDynamicPrice(start, end, baseRate, tz)` → minute-by-minute accumulation; peak minutes priced at `1.5x`.
- `utils/timeUtils.js`
  - `formatTime(iso, tz)` → human-readable local time (e.g., `5:30 PM`). Used in conflict messages.

**Services (Business Logic)**
- `services/roomsService.js`
  - `getAllRoomsService()` → fetches all rooms.
  - `seedDefaultRoomsService()` → seeds fixed defaults:
- `services/bookingService.js`
  - `createBookingService({ roomId, userName, startTime, endTime })`
    - Validates required fields.
    - Parses times (`parseISO`) and enforces `start < end`.
    - Caps duration to `≤ 12 hours`.
    - Loads room (`getRoomByRoomId`) and rejects if missing.
    - Prevents overlaps via `findOverlap` rule: `start < requestedEnd AND end > requestedStart`.
    - Computes price via `computeDynamicPrice` using `BUSINESS_TZ`.
    - Persists as `CONFIRMED` booking.
  - `cancelBookingService(id)`
    - 404 if booking not found.
    - 400 if already `CANCELED`.
    - Enforces cutoff: only allowed if now is strictly more than 2 hours before `startTime`.
    - Performs cancel; fails with `INTERNAL` if update didn’t apply.
  - `listBookingsService()` → returns all bookings (admin).
- `services/analyticsService.js`
  - `computeAnalyticsService({ from, to })`
    - Requires `YYYY-MM-DD` boundaries; maps to timezone day start/end via `startOfDayISO` / `endOfDayISO`.
    - Aggregates confirmed bookings by room: `totalHours` and `totalRevenue` with 2-decimal rounding.

**Controllers (HTTP Layer)**
- `controllers/roomsController.js`
  - `getRooms(req, res)` → `200` with rooms array.
  - `seedRoomsController(req, res)` → `200` with `{ seeded: true, rooms }`.
- `controllers/bookingsController.js`
  - `createBooking(req, res)` → on success `201` with `{ id, roomId, userName, totalPrice, status }`.
    - Error mapping by `e.code`:
      - `VALIDATION_ERROR` → `400`
      - `NOT_FOUND` → `404`
      - `CONFLICT` → `409`
      - otherwise → `500`
  - `cancelBooking(req, res)` → `200` with `{ status: 'CANCELED' }`; similar error mapping.
  - `listBookings(req, res)` → `200` with normalized booking list for admin.
- `controllers/analyticsController.js`
  - `analytics(req, res)` → `200` with per-room aggregates; `400` on invalid dates.

**Routes (HTTP)**
- Base path: `/api`
- Rooms (`backend/src/routes/rooms.js`)
  - `GET /api/rooms` → list rooms
  - `POST /api/rooms/seed` → seed defaults
- Bookings (`backend/src/routes/bookings.js`)
  - `GET /api/bookings` → list all
  - `POST /api/bookings/create` → create booking
  - `POST /api/bookings/:id/cancel` → cancel booking
- Analytics (`backend/src/routes/analytics.js`)
  - `GET /api/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD` → aggregates

**Request/Response Examples**
- Create booking
  - Request: `POST /api/bookings/create`
  - Body:
    ```json
    { "roomId": "101", "userName": "Alice", "startTime": "2025-11-20T10:00:00.000Z", "endTime": "2025-11-20T12:30:00.000Z" }
    ```
  - Success `201`:
    ```json
    { "id": "<mongoId>", "roomId": "101", "userName": "Alice", "totalPrice": 412.5, "status": "CONFIRMED" }
    ```
  - Possible errors:
    - `400`: validation (missing fields, start ≥ end, duration > 12h)
    - `404`: room not found
    - `409`: overlap (message includes formatted local times)
- Cancel booking
  - Request: `POST /api/bookings/<id>/cancel`
  - Success `200`: `{ "status": "CANCELED" }`
  - Errors: `404` not found; `400` already canceled or within 2-hour cutoff.
- List bookings
  - Request: `GET /api/bookings`
  - `200` with array: `{ id, roomId, userName, startTime, endTime, totalPrice, status }[]`
- Rooms
  - `GET /api/rooms` → `200` array of rooms
  - `POST /api/rooms/seed` → `200` `{ seeded: true, rooms: [...] }`
- Analytics
  - `GET /api/analytics?from=2025-11-01&to=2025-11-30`
  - `200` example:
    ```json
    [
      { "roomId": "101", "roomName": "Cabin 1", "totalHours": 12.5, "totalRevenue": 250.0 },
      { "roomId": "201", "roomName": "Board Room", "totalHours": 8.0, "totalRevenue": 160.0 }
    ]
    ```

**Business Rules & Notes**
- Timezone-aware operations use `BUSINESS_TZ` (default `Asia/Kolkata`).
- Dynamic pricing:
  - Iterates per minute; peak minutes (Mon–Fri, 10–12:59 and 16–18:59) billed at `1.5x`.
  - Non-peak minutes billed at `baseHourlyRate` converted to per-minute.
- Overlap rule: existing confirmed booking overlaps if `existing.startTime < new.endTime AND existing.endTime > new.startTime`.
- Cancellation policy: allowed only more than 2 hours before the booking `startTime`.
- Seeding: server seeds default rooms on first run if DB is empty.

**Local Development**
- Prereqs: Node.js 18+, MongoDB running locally or via `MongoURL`.
- Start API:
  - From `backend/`: `node src/server.js` (or use your runner).
- Sample `curl`:
  - `curl http://localhost:3001/api/health`
  - `curl http://localhost:3001/api/rooms`
  - `curl -X POST http://localhost:3001/api/bookings/create -H "Content-Type: application/json" -d '{"roomId":"101","userName":"Alice","startTime":"2025-11-20T10:00:00.000Z","endTime":"2025-11-20T12:30:00.000Z"}'`

**Frontend Integration (Context)**
- Frontend calls the above endpoints for listing rooms, creating/canceling bookings, and rendering analytics.
- Booking conflicts return human-readable window via `formatTime(...)` in `BUSINESS_TZ`.

**Frontend Overview**
- Vite + React + React Router + Tailwind CSS for UI.
- Pages: `RoomsListing`, `BookingForm`, `AdminView` with shared `NavBar`.
- API client encapsulates base URL and request handling.

**Entry Point & Routing**
- `frontend/src/main.jsx`
  - Wraps `<App />` in `BrowserRouter` and mounts global `<Toaster />` for notifications.
- `frontend/src/App.jsx`
  - Routes:
    - `GET /rooms` → `RoomsListing`
    - `GET /booking/:roomId` → `BookingForm` (uses a prefixed param like `room-no-101` and strips prefix internally)
    - `GET /admin-view` → `AdminView`
    - `/` and unknown paths redirect to `/rooms`.
  - `NavBar` highlights active route using `NavLink`.

**Pages**
- `RoomsListing.jsx`
  - Fetches rooms via `api.getRooms()` and maps backend fields (`roomId`, `name`, `capacity`, `baseHourlyRate`) to UI shape.
  - Renders a grid of `RoomCard` components.
  - On booking, navigates to `/booking/room-no-<roomId>` to obfuscate raw room ID.
- `BookingForm.jsx`
  - Reads `:roomId` via `useParams`, strips `room-no-` prefix, loads the specific room from `api.getRooms()` results.
  - Time inputs use frontend time utils and compose payload times via `toISTIso(date, time)` to align with backend timezone handling.
  - Computes pricing using the loaded `room.baseHourlyRate`; submits to `api.createBooking` and navigates to Admin View on success.
  - Displays loading and error states; includes a “Back to Rooms” button.
- `AdminView.jsx`
  - Tabs/sections for Analytics and Bookings lists.
  - Bookings Management includes filters for `status` and `room` with pagination over filtered results; clear button resets filters.
  - Analytics section allows selecting `from` and `to` and shows KPIs plus a breakdown table.

**API Client**
- `frontend/src/api/client.js`
  - `BASE_URL` from `VITE_API_BASE_URL` or defaults to `http://localhost:3001/api`.
  - Common `request(path, options)` handles JSON parsing and error normalization.
  - Endpoints:
    - `getRooms()` → `GET /rooms`
    - `seedRooms()` → `POST /rooms/seed`
    - `listBookings()` → `GET /bookings`
    - `createBooking(payload)` → `POST /bookings/create`
    - `cancelBooking(id)` → `POST /bookings/:id/cancel`
    - `getAnalytics(from, to)` → `GET /analytics?from=...&to=...`
  - `toISTIso(dateStr, timeStr)` → builds `YYYY-MM-DDTHH:mm:00+05:30` for backend to treat start/end in business-local time.

**Frontend Time Utilities**
- `frontend/src/utils/time.js`
  - `BUSINESS_TZ = 'Asia/Kolkata'`
  - `formatDateTime(dateTimeString)` → returns `{ date, time }` formatted in business timezone.
  - `businessTodayISO()` → business-local `YYYY-MM-DD` for date inputs.
  - `businessNowHM()` → business-local `HH:mm` (24h) for default time inputs.
  - `hoursUntil(dateTimeString)` → for enabling/disabling cancel actions.

**Styling & UI**
- Tailwind CSS configured (`tailwind.config.js`, `postcss.config.js`); `index.css` includes base styles.
- Icons via `lucide-react` for visual affordances (e.g., `Building2`, `Filter`, `Calendar`).
- `react-hot-toast` provides global toast notifications (`<Toaster />` in `main.jsx`).

**Frontend Env**
- `VITE_API_BASE_URL` (optional): overrides API base; defaults to `http://localhost:3001/api`.
  - Example `.env` in `frontend/`:
    ```env
    VITE_API_BASE_URL=http://localhost:3001/api
    ```

**Developer Notes**
- Deep-linking: Booking pages accept prefixed `roomId` (`/booking/room-no-101`); the form strips `room-no-` internally.
- Pricing: driven by backend logic; frontend submits ISO with `+05:30` offset to align with server timezone rules.
- Filters and pagination: Bookings list filters are applied before pagination; changing filters resets to page 1.