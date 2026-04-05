-- Add is_open column for shop open/closed status (run this if you already have the tables)
ALTER TABLE food_stalls ADD COLUMN IF NOT EXISTS is_open boolean DEFAULT true;
ALTER TABLE laundry_shops ADD COLUMN IF NOT EXISTS is_open boolean DEFAULT true;

-- Fix RLS: allow update when owner_email matches user email (case-insensitive)
DROP POLICY IF EXISTS "Allow update food_stalls owner or admin" ON food_stalls;
CREATE POLICY "Allow update food_stalls owner or admin" ON food_stalls FOR UPDATE TO authenticated USING (
  lower(owner_email) = lower((SELECT email FROM users WHERE auth_id = auth.uid() LIMIT 1)) OR
  EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role IN ('admin','super_admin'))
);

DROP POLICY IF EXISTS "Allow update laundry_shops owner or admin" ON laundry_shops;
CREATE POLICY "Allow update laundry_shops owner or admin" ON laundry_shops FOR UPDATE TO authenticated USING (
  lower(owner_email) = lower((SELECT email FROM users WHERE auth_id = auth.uid() LIMIT 1)) OR
  EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role IN ('admin','super_admin'))
);
