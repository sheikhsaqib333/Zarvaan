CREATE TABLE IF NOT EXISTS upload_files (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,
  original_name TEXT NOT NULL,
  size INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS upload_chunks (
  file_id TEXT NOT NULL,
  part_index INTEGER NOT NULL,
  content BLOB NOT NULL,
  PRIMARY KEY (file_id, part_index)
);