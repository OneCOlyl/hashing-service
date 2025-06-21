require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const {initializeDatabase, getLogsByUserId} = require('./database');

const app = express()
const port = process.env.PORT || 3001


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
    return res.json({ error: 'Доступ запрещён' })
  }
  
  next()
}

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' })
})

app.get('/api/admin/check', requireAdmin, (req, res) => {
  res.json({
    isAdmin: true,
    email: process.env.ADMIN_EMAIL,
  })
})

app.get('/api/admin/logs/:userId', requireAdmin, async (req, res) => {
  const { userId } = req.params;
  try {
    const logs = await getLogsByUserId(userId);
    res.json(logs);
  } catch (error) {
    console.error(`Ошибка при получении логов для пользователя ${userId}:`, error);
    res.json({ error: 'Ошибка на сервере при получении логов' });
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
