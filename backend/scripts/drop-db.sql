-- Terminate all connections to the database
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'drone_survey_db'
AND pid <> pg_backend_pid();

-- Drop the database
DROP DATABASE IF EXISTS drone_survey_db; 