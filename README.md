# Naturally Rooted Salon

A premium natural hair salon website for **Naturally Rooted Salon** in Ibadan, Nigeria — built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **MongoDB (Mongoose)**.

The site presents the salon brand, services, and ethos, and includes a multi-step booking flow that persists appointments to MongoDB through a backend API.

## Tech Stack

- **Framework:** Next.js 15 (App Router, `src/` directory)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** Motion
- **Icons:** lucide-react
- **Database:** MongoDB via Mongoose

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── bookings/
│   │       └── route.ts      # Bookings API (POST create, GET list)
│   ├── globals.css           # Tailwind theme & brand tokens
│   ├── layout.tsx            # Root layout + metadata
│   └── page.tsx              # Home route (renders the salon UI)
├── components/
│   └── SalonApp.tsx          # Full client-side salon UI + booking modal
├── lib/
│   └── mongodb.ts            # Cached Mongoose connection helper
└── models/
    └── Booking.ts            # Booking Mongoose model
```

## Getting Started

**Prerequisites:** Node.js 18.18+ and a running MongoDB instance (local or Atlas).

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure the database connection. Copy `.env.example` to `.env.local` and set your URI:

   ```bash
   cp .env.example .env.local
   ```

   ```
   MONGODB_URI="mongodb://localhost:27017/naturally-rooted"
   ```

   If `MONGODB_URI` is not set, the app falls back to `mongodb://localhost:27017/naturally-rooted`.

3. Run the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## API

### `POST /api/bookings`

Creates a booking. Request body:

```json
{
  "service": "Wash & Deep Conditioning",
  "date": "2026-07-01",
  "time": "10:30 AM",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "0812 345 6789"
}
```

Returns `201` with the created booking, or `400` for validation errors.

### `GET /api/bookings`

Returns all bookings, newest first.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint with ESLint
- `npm run typecheck` — TypeScript type checking
