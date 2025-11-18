# Workspace Booking Backend

Environment variables:
- `PORT`: port for the API server (default `3001`).
- `DB_PATH`: SQLite database file path (default `./data.db`).

Routes:
- `GET /api/rooms` – list rooms
- `POST /api/rooms/seed` – seed default rooms
- `POST /api/bookings` – create booking (conflict prevention + dynamic pricing)
- `POST /api/bookings/:id/cancel` – cancel booking (> 2 hours before start)
- `GET /api/bookings` – list bookings (admin)
- `GET /api/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD` – utilization and revenue