-- Add is_open column for Shop Open / Shop Closed (Active / Away) toggle
ALTER TABLE food_stalls ADD COLUMN IF NOT EXISTS is_open boolean DEFAULT true;
ALTER TABLE laundry_shops ADD COLUMN IF NOT EXISTS is_open boolean DEFAULT true;
