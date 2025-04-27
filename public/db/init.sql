-- 1) Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2) Таблица голосов
CREATE TABLE IF NOT EXISTS votes (
  id        SERIAL PRIMARY KEY,
  user_id   INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meme_id   VARCHAR(50)   NOT NULL,
  rating    SMALLINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
  voted_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3) Таблица комментариев
CREATE TABLE IF NOT EXISTS comments (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meme_id    VARCHAR(50) NOT NULL,
  content    TEXT        NOT NULL,
  created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4) Индексы (опционально — для ускорения выборок)
CREATE INDEX IF NOT EXISTS idx_votes_meme   ON votes(meme_id);
CREATE INDEX IF NOT EXISTS idx_comments_meme ON comments(meme_id);
