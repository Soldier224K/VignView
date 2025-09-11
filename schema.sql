-- backend/db/schema.sql
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  title TEXT,
  description TEXT,
  category TEXT,
  digipin TEXT,
  source TEXT,
  media_path TEXT,
  ai_response JSONB,
  created_at TIMESTAMP DEFAULT now()
);
