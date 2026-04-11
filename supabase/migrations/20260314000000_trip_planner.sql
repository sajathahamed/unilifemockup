-- Tourism Management: Trip Planner module
-- Run in Supabase SQL Editor or via Supabase CLI

CREATE TABLE IF NOT EXISTS trips (
  id BIGSERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  start_location VARCHAR(500) NOT NULL,
  destination VARCHAR(500) NOT NULL,
  days INT NOT NULL DEFAULT 1,
  travelers INT NOT NULL DEFAULT 1,
  hotel_budget_per_night DECIMAL(10,2) DEFAULT 0,
  food_budget_per_day DECIMAL(10,2) DEFAULT 0,
  transport_cost_per_km DECIMAL(10,2) DEFAULT 0,
  total_budget DECIMAL(12,2) DEFAULT 0,
  distance_km DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trip_places (
  id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  place_name VARCHAR(255) NOT NULL,
  rating DECIMAL(3,2),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  place_id VARCHAR(255),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_places_trip ON trip_places(trip_id);

COMMENT ON TABLE trips IS 'Trip Planner: user trips with budget and itinerary';
COMMENT ON TABLE trip_places IS 'Tourist attractions/places added to a trip itinerary';
