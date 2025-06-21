require('dotenv').config({ path: '../development.env' });
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const crypto = require('crypto');
const {initializeDatabase, getLogsByUserId, findOrCreateUser, addLog, linkUserToLog, getUsers} = require('./database');

const app = express()
const port = process.env.BACKEND_PORT || 3001


app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())

const requireAdmin = (req, res, next) => {
  const adminEmail = process.env.ADMIN_EMAIL
  const userEmail = req.headers['x-user-email']

  if (!adminEmail || !userEmail || userEmail !== adminEmail) {
    return res.json({error: 'Доступ запрещён'})
  }

  next()
}

app.get('/', (req, res) => {
  res.json({message: 'Hello World!'})
})

app.get('/api/admin/check', requireAdmin, (req, res) => {
  res.json({
    isAdmin: true,
    email: process.env.ADMIN_EMAIL,
  })
})

app.get('/api/admin/logs/:userId', requireAdmin, async (req, res) => {
  const {userId} = req.params;
  try {
    const logs = await getLogsByUserId(userId);
    res.json(logs);
  } catch (error) {
    console.error(`Ошибка при получении логов для пользователя ${userId}:`, error);
    res.json({error: 'Ошибка на сервере при получении логов'});
  }
});

app.get('/api/admin/users', requireAdmin, async (req, res) => {
  const {search} = req.query;
  try {
    const users = await getUsers(search);
    res.json(users);
  } catch (error) {
    console.error('Ошибка при поиске пользователей:', error);
    res.status(500).json({error: 'Ошибка на сервере при поиске пользователей'});
  }
});

app.post('/api/hash', async (req, res) => {
  const {text, algorithm} = req.body;
  const userEmail = req.headers['x-user-email'];

  if (!text || !algorithm) {
    return res.status(400).json({error: 'Где текст и алгоритм??!!!'});
  }

  if (!userEmail) {
    return res.status(401).json({error: 'Email пользователя не предоставлен'});
  }

  try {
    const hashedText = crypto.createHash(algorithm).update(text).digest('hex');

    const user = await findOrCreateUser({name: userEmail, email: userEmail});

    const log = await addLog({original_text: text, algorithm, hashed_text: hashedText});

    await linkUserToLog(user.id, log.id);

    res.json({hashedText});
  } catch (error) {
    console.error('Ошибка при хэшировании:', error);
    res.status(500).json({error: 'Ошибка на сервере при хэшировании'});
  }
});

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(port, () => {
      console.log(`Сервер запущен порт? ${port}`)
    })
  } catch (error) {
    console.error('Ошибка запуска сервера:', error)
    process.exit(1)
  }
}

startServer()
