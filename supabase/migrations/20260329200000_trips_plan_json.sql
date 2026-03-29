-- Persist full AI trip plan for view/edit (budget breakdown, daily plan, tips).
ALTER TABLE trips ADD COLUMN IF NOT EXISTS plan_json JSONB NULL;

COMMENT ON COLUMN trips.plan_json IS 'Optional snapshot from Trip Planner AI (breakdown, dailyPlan, tips, etc.)';
