-- ============================================================
--  SmartFix — Technicians Table Migration
--  ADDITIVE ONLY — existing data is preserved
--  Run once in MySQL Workbench or terminal
-- ============================================================

-- Step 1: Add user_id FK (nullable so legacy rows still work)
ALTER TABLE technicians
  ADD COLUMN IF NOT EXISTS user_id INT NULL AFTER id;

-- Step 2: Add skills column (mirrors category for new registrations)
ALTER TABLE technicians
  ADD COLUMN IF NOT EXISTS skills VARCHAR(200) NULL AFTER category;

-- Step 3: Add availability column (mirrors status for new registrations)
ALTER TABLE technicians
  ADD COLUMN IF NOT EXISTS availability ENUM('Available','Busy') DEFAULT 'Available' AFTER status;

-- Step 4: Add experience column
ALTER TABLE technicians
  ADD COLUMN IF NOT EXISTS experience VARCHAR(100) NULL;

-- Step 5: Add FK constraint for user_id (only if users table exists)
-- (skipped to keep it simple — user_id is just a reference, app logic handles it)

-- ============================================================
--  VERIFY
-- ============================================================
-- DESCRIBE technicians;
-- SELECT id, name, user_id, category, skills, status, availability, experience FROM technicians LIMIT 5;
