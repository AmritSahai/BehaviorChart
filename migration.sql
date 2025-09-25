-- This script updates the pin_placements table to use a board-normalized coordinate system.

-- Step 1: Add the new columns for normalized board coordinates.
-- We add them as NULLABLE first to handle existing rows.
ALTER TABLE public.pin_placements
ADD COLUMN board_x_percentage FLOAT,
ADD COLUMN board_y_percentage FLOAT;

-- Step 2: Migrate the data from the old columns to the new ones.
-- This query assumes you had 4 equally sized categories.
-- It converts the old category-relative percentages to the new board-relative percentages.
UPDATE public.pin_placements
SET
  board_x_percentage = x_percentage / 100.0,
  board_y_percentage = (category_index * 0.25) + (y_percentage / 100.0 * 0.25)
WHERE
  x_percentage IS NOT NULL AND y_percentage IS NOT NULL AND category_index IS NOT NULL;

-- Step 3: Now that the new columns are populated, enforce the NOT NULL constraint.
-- We'll also provide a default value for any new rows that might be created
-- before the application code is fully updated.
ALTER TABLE public.pin_placements
ALTER COLUMN board_x_percentage SET NOT NULL,
ALTER COLUMN board_y_percentage SET NOT NULL;

-- Step 4: Remove the old, now-redundant columns.
ALTER TABLE public.pin_placements
DROP COLUMN category_index,
DROP COLUMN x_percentage,
DROP COLUMN y_percentage;
