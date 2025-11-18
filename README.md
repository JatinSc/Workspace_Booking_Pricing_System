# Workspace Booking & Pricing System

A full-stack mini system for browsing rooms, creating and canceling bookings, and viewing admin analytics — with real-world rules like dynamic pricing, conflict prevention, cancellation policy, and timezone-accurate calculations.

This project follows clean architecture with clear layers:
routes → controllers → services → models → utils.

---

## 🚀 Live Deployment

| Component  | URL |
|-----------|-----|
| **Frontend** | https://workspace-booking-system.netlify.app/ |
| **Backend**  | https://booking-system-backend-j1c9.onrender.com |

---

## 📦 How to Run Locally

### 1) Clone Repository
```bash
git clone https://github.com/JatinSc/Workspace_Booking_Pricing_System.git
cd Workspace_Booking_Pricing_System
```

### 2) Backend Setup
- Install dependencies
```bash
cd backend
npm install
```
- Create `backend/.env`
```env
PORT=3001
MongoURL=<your mongodb connection string>
BUSINESS_TZ=Asia/Kolkata
```
- Start server
```bash
npm start
```
- Base URL and health
```
http://localhost:3001/api
http://localhost:3001/api/health
```

### 3) Frontend Setup
- Install dependencies
```bash
cd frontend
npm install
```
- Create `frontend/.env`
```env
VITE_API_BASE_URL=http://localhost:3001/api
# or your deployed backend URL
```
- Start dev server
```bash
npm run dev
```
- App URL
```
http://localhost:5173
```

---

## 🔌 Backend API Samples

### Health Check
```
GET /api/health
```
Response
```json
{ "ok": true }
```

### List Rooms
```
GET /api/rooms
```
Response
```json
[
  {
    "roomId": "101",
    "name": "Cabin 1",
    "capacity": 4,
    "baseHourlyRate": 200
  }
]
```

### Create Booking
```
POST /api/bookings/create
```
Request
```json
{
  "roomId": "101",
  "userName": "Alice",
  "startTime": "2025-11-20T10:00:00+05:30",
  "endTime": "2025-11-20T12:30:00+05:30"
}
```
Success
```json
{ "id": "655fae12ef98e", "roomId": "101", "userName": "Alice", "totalPrice": 412.5, "status": "CONFIRMED" }
```
Errors
```json
{ "error": "Room already booked from 5:30 PM to 6:30 PM" }
```
```json
{ "error": "Start time must be before end time" }
```

### Cancel Booking
```
POST /api/bookings/:id/cancel
```
Request
```json
{ "id": "655fae12ef98e" }
```
Success
```json
{ "status": "CANCELED" }
```
Errors
```json
{ "error": "Booking already canceled" }
```
```json
{ "error": "Cannot cancel within 2 hours of start time" }
```

### List All Bookings
```
GET /api/bookings
```

### Analytics
```
GET /api/analytics?from=2025-11-01&to=2025-11-30
```
Response
```json
[
  { "roomId": "101", "roomName": "Cabin 1", "totalHours": 12.5, "totalRevenue": 250.0 }
]
```

---

## 🧠 Dynamic Pricing Rules
- Base pricing = `baseHourlyRate`
- Peak hours (Mon–Fri): `10:00–12:59` and `16:00–18:59`
- Peak multiplier = `1.5×`
- Pricing is computed per minute for accuracy.
- Total = sum of per-minute prices across the interval.

## 📆 Cancellation Policy
- A confirmed booking can be canceled only if now is more than `2 hours` before its `startTime`.
- Otherwise → `400 Bad Request`.
- Canceled bookings do not appear in analytics.

## ⏱ Time Zone Notes
- Backend and frontend use `Asia/Kolkata (IST)`.
- Frontend sends ISO timestamps with `+05:30` offset to ensure backend consistency.

---

##  Admin View
To improve readability and maintainability, the Admin page has been modularized into self-contained UI components and hooks. Behavior is unchanged; composition is cleaner and easier to extend and test.

- components created
  - `frontend/src/components/admin/AdminHeader.jsx` — page title and toggle between Bookings and Analytics.
  - `frontend/src/components/admin/AnalyticsPanel.jsx` — date range inputs, KPIs, and room-wise revenue table.
  - `frontend/src/components/admin/BookingsManagement.jsx` — filters, bookings table, and pagination controls.

- hooks used
  - `frontend/src/hooks/useAdminAnalytics.js` — analytics state, derived totals, and fetch handler.
  - `frontend/src/hooks/useAdminBookings.js` — bookings state, filters, pagination, fetch + cancel handlers.
