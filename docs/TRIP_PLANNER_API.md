# Trip Planner – API & usage

## Environment

- `GOOGLE_MAPS_API_KEY` – Google Cloud API key with **Places API (New)**, **Distance Matrix API**, and **Geocoding API** enabled.

## API routes

### GET /api/trip/places?location=lat,lng

Fetch tourist attractions near a point.

**Example:**
```bash
curl "http://localhost:3000/api/trip/places?location=11.4134,76.6952"
```

**Response:** `[{ id, name, rating, latitude, longitude, address, imageUrl }, ...]`

---

### GET /api/trip/geocode?address=...

Resolve an address to coordinates.

**Example:**
```bash
curl "http://localhost:3000/api/trip/geocode?address=Ooty%2C%20Tamil%20Nadu"
```

**Response:** `{ lat, lng, formattedAddress }`

---

### GET /api/trip/distance?origins=...&destinations=...

Get distance and duration between origin and destination (addresses or lat,lng).

**Example:**
```bash
curl "http://localhost:3000/api/trip/distance?origins=Chennai&destinations=Ooty"
```

**Response:** `{ distanceKm, distanceText, durationSeconds, durationText }`

---

### POST /api/trip/budget

Compute trip budget. Requires auth for saving; calculation works without auth.

**Body:**
```json
{
  "distanceKm": 520,
  "days": 3,
  "travelers": 2,
  "hotelBudgetPerNight": 3000,
  "foodBudgetPerDay": 800,
  "transportCostPerKm": 12
}
```

**Response:**
```json
{
  "travelCost": 6240,
  "hotelCost": 9000,
  "foodCost": 4800,
  "totalBudget": 20040,
  "breakdown": { "travel": 6240, "hotel": 9000, "food": 4800 }
}
```

---

### POST /api/trip (auth required)

Create a trip and optional places.

**Body:**
```json
{
  "start_location": "Chennai",
  "destination": "Ooty",
  "days": 3,
  "travelers": 2,
  "hotel_budget_per_night": 3000,
  "food_budget_per_day": 800,
  "transport_cost_per_km": 12,
  "total_budget": 20040,
  "distance_km": 520,
  "places": [
    { "place_name": "Ooty Lake", "rating": 4.5, "latitude": 11.41, "longitude": 76.69, "place_id": "...", "image_url": "..." }
  ]
}
```

---

### GET /api/trip (auth required)

List current user’s trips (with `trip_places`).

---

### GET /api/trip/[id] (auth required)

Get one trip by id (with `trip_places`). User must own the trip.

---

## Budget formula

- **Travel** = `distanceKm × transportCostPerKm`
- **Hotel** = `hotelBudgetPerNight × days`
- **Food** = `foodBudgetPerDay × travelers × days`
- **Total** = Travel + Hotel + Food

Implemented in `lib/trip-planner/budget.ts` and used by `POST /api/trip/budget`.
