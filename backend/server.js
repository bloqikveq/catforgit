// backend/server.js
console.log('▶️ Начало server.js');
require('dotenv').config();

const express   = require('express');
const cors      = require('cors');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const { Pool }  = require('pg');
const path      = require('path');

const app    = express();
const pool   = new Pool({ connectionString: process.env.DATABASE_URL });
const SECRET = process.env.JWT_SECRET || 'секрет_по_умолчанию';

// middlewares
app.use(cors());
app.use(express.json());

// JWT-middleware
function authenticateToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Нет заголовка Authorization' });
  const token = header.split(' ')[1];
  jwt.verify(token, SECRET, (err, payload) => {
    if (err) return res.status(403).json({ error: 'Токен невалиден' });
    req.userId = payload.userId;
    next();
  });
}

// маршруты API
const api = express.Router();

// — регистрация
api.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users(email,password_hash) VALUES($1,$2) RETURNING id',
      [email, hash]
    );
    res.status(201).json({ id: rows[0].id });
  } catch (e) {
    if (e.code === '23505') return res.status(409).send('Email уже занят');
    console.error(e);
    res.sendStatus(500);
  }
});

// — логин
api.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query(
      'SELECT id,password_hash FROM users WHERE email=$1',
      [email]
    );
    if (!rows.length) return res.status(404).send('Пользователь не найден');
    const user = rows[0];
    if (!(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).send('Неверный пароль');
    const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '12h' });
    res.json({ token });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// — профиль
api.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id,email,created_at FROM users WHERE id=$1',
      [req.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// — топ-5 мемов
api.get('/top5', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT meme_id, ROUND(AVG(rating)::numeric,1) AS avg_rating
        FROM votes
       GROUP BY meme_id
       ORDER BY avg_rating DESC
       LIMIT 5
    `);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// — голосование
api.post('/vote', authenticateToken, async (req, res) => {
  const { meme_id, rating } = req.body;
  try {
    await pool.query(
      'INSERT INTO votes(user_id,meme_id,rating) VALUES($1,$2,$3)',
      [req.userId, meme_id, rating]
    );
    res.sendStatus(201);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// — все комментарии
api.get('/comments', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.id, c.content, c.created_at, c.meme_id, u.email AS author
        FROM comments c
        JOIN users u ON u.id = c.user_id
       ORDER BY c.created_at ASC
    `);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// — комментарии к конкретному мему
api.get('/comments/:memeId', async (req, res) => {
  const { memeId } = req.params;
  try {
    const { rows } = await pool.query(`
      SELECT c.id, c.content, c.created_at, u.email AS author
        FROM comments c
        JOIN users u ON u.id = c.user_id
       WHERE c.meme_id = $1
       ORDER BY c.created_at ASC
    `, [memeId]);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// — добавить комментарий
api.post('/comments', authenticateToken, async (req, res) => {
  const { meme_id, content } = req.body;
  try {
    const { rows } = await pool.query(`
      INSERT INTO comments(user_id,meme_id,content)
      VALUES($1,$2,$3) RETURNING id,created_at
    `, [req.userId, meme_id, content]);
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// — сброс пароля (быстрый)
api.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) return res.status(400).send('Укажите email и новый пароль');
  try {
    const { rows } = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (!rows.length) return res.status(404).send('Пользователь не найден');
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash=$1 WHERE email=$2', [hash, email]);
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// — смена пароля залогиненным
api.post('/change-password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).send('Укажите старый и новый пароли');
  try {
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id=$1', [req.userId]);
    if (!rows.length) return res.status(404).send('Пользователь не найден');
    if (!(await bcrypt.compare(oldPassword, rows[0].password_hash)))
      return res.status(401).send('Старый пароль неверен');
    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [newHash, req.userId]);
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// вешаем роуты на /api
app.use('/api', api);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API слушает порт ${PORT}`));

// отдаём статику
app.use(express.static(path.join(__dirname, '../public')));

// SPA-фоллбэк — вот здесь **'*'**, а не `'/*'`
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});