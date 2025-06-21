const postgres = require('postgres');

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = process.env;
const connectionString = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}`;

const sql = postgres(connectionString, {
    onnotice: process.env.NODE_ENV === 'development' ? console.log : () => {},
});

async function initializeDatabase() {
  try {
    await sql`
        CREATE TABLE IF NOT EXISTS cls_logs
        (
            id uuid NOT NULL DEFAULT gen_random_uuid(),
            original_text TEXT NOT NULL,
            algorithm TEXT NOT NULL,
            hashed_text TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT(now() AT TIME ZONE 'utc'::text)
        )
    `;
    await sql`
        CREATE TABLE IF NOT EXISTS cls_users
        (
            id uuid NOT NULL DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP NOT NULL DEFAULT(now() AT TIME ZONE 'utc'::text),
            last_login TIMESTAMP
        )
    `;
    await sql`
        CREATE TABLE IF NOT EXISTS tp_user_logs(
            id uuid NOT NULL DEFAULT gen_random_uuid(),
            id_user uuid NOT NULL,
            id_log uuid NOT NULL
        )
    `;
    console.log('База данных инициализирована успешно');
  } catch (error) {
    console.error('Ошибка инициализации базы данных:', error);
    throw error;
  }
}

async function getLogsByUserId(userId) {
  try {
    const logs = await sql`
      SELECT l.*
      FROM cls_logs AS l
      INNER JOIN tp_user_logs AS tul ON l.id = tul.id_log
      WHERE tul.id_user = ${userId}
      ORDER BY l.created_at DESC
    `;
    return logs;
  } catch (error) {
    console.error('Ошибка при получении логов пользователя:', error);
    throw error;
  }
}

async function findOrCreateUser({ name, email }) {
  try {
    const users = await sql`
      INSERT INTO cls_users (name, email, last_login)
      VALUES (${name}, ${email}, NOW() AT TIME ZONE 'utc')
      ON CONFLICT (email) DO UPDATE
      SET last_login = NOW() AT TIME ZONE 'utc'
      RETURNING *;
    `;
    return users[0];
  } catch (error) {
    console.error('Ошибка при добавлении или поиске пользователя:', error);
    throw error;
  }
}

async function addLog({ original_text, algorithm, hashed_text }) {
    try {
        const logs = await sql`
            INSERT INTO cls_logs (original_text, algorithm, hashed_text)
            VALUES (${original_text}, ${algorithm}, ${hashed_text})
            RETURNING *;
        `;
        return logs[0];
    } catch (error) {
        console.error('Ошибка при добавлении лога:', error);
        throw error;
    }
}

async function linkUserToLog(userId, logId) {
    try {
        await sql`
            INSERT INTO tp_user_logs (id_user, id_log)
            VALUES (${userId}, ${logId});
        `;
    } catch (error) {
        console.error('Ошибка при связывании пользователя и лога:', error);
        throw error;
    }
}

async function getUsers(searchQuery = '') {
    try {
        const users = await sql`
            SELECT id, name, email
            FROM cls_users
            WHERE name ILIKE ${'%' + searchQuery + '%'}
               OR email ILIKE ${'%' + searchQuery + '%'}
            ORDER BY name
            LIMIT 20
        `;
        return users;
    } catch (error) {
        console.error('Ошибка при поиске пользователей:', error);
        throw error;
    }
}

module.exports = {
  sql,
  initializeDatabase,
  getLogsByUserId,
  findOrCreateUser,
  addLog,
  linkUserToLog,
  getUsers,
}; 