CREATE DATABASE memostat;
\c memostat;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  meme_id VARCHAR(50) NOT NULL,
  rating SMALLINT NOT NULL,
  voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Топ‑5 мемов
SELECT meme_id, AVG(rating) AS avg_rating
FROM votes
GROUP BY meme_id
ORDER BY avg_rating DESC
LIMIT 5;