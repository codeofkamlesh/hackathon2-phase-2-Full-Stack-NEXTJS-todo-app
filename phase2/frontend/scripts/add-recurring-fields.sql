-- Add recurring task fields to the task table
ALTER TABLE "task" ADD COLUMN IF NOT EXISTS "recurring" BOOLEAN DEFAULT FALSE;
ALTER TABLE "task" ADD COLUMN IF NOT EXISTS "recurrencePattern" TEXT;

-- Add proper indexes for the new columns if needed
CREATE INDEX IF NOT EXISTS idx_task_recurring ON "task"("recurring");
CREATE INDEX IF NOT EXISTS idx_task_recurrence_pattern ON "task"("recurrencePattern");

-- Confirmation message
DO $$
BEGIN
    RAISE NOTICE 'Recurring task fields have been added to the task table!';
    RAISE NOTICE 'Columns added: recurring (BOOLEAN), recurrencePattern (TEXT)';
END $$;