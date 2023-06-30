require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

const testPostgres = async () => {
  const result = await pool.query('SELECT $1::text as name', ['db connected']);
  console.log(result.rows[0].name);
};

testPostgres();

const createDummyData = async () => {
  await pool.query('TRUNCATE users');
  await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
  await pool.query(
    'INSERT INTO users(name, email) VALUES($1, $2), ($3, $4), ($5, $6), ($7,$8), ($9,$10)',
    ['Yemi', 'yemi@gmail.com', 'Temi', 'temi@gmail.com', 'Tola', 'tola@gmail.com', 'Bayo', 'bayo@gmail.com', 'Tolu', 'tolu@gmail.com'],
  );
};

createDummyData();

const getUsers = async (req, res) => {
  try {
    const users = await pool.query('SELECT * FROM users ORDER BY id ASC');
    return res.status(200).json(users.rows);
  } catch (err) {
    return res.status(400).send('Error getting users');
  }
};

const getUserById = async (request, response) => {
  const id = parseInt(request.params.id, 10);

  const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

  if (user.rows.length === 0) {
    return response.status(400).send(`User with ID: ${id} not found`);
  }
  return response.status(200).json(user.rows[0]);
};

const createUser = async (request, response) => {
  const { name, email } = request.body;

  try {
    const userEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userEmail.rows.length === 0) {
      const insertUser = await pool.query('INSERT INTO users (name, email) VALUES ($1 ,$2) RETURNING *', [name, email]);
      if (insertUser.rows) {
        return response.status(200).json(insertUser.rows[0]);
      }
    } else {
      return response.status(400).send(`User already exist with the email: ${email}`);
    }
  } catch (err) {
    return response.status(400).send('Error creating a new user');
  }
};

const updateUser = async (request, response) => {
  const id = parseInt(request.params.id, 10);
  const { name, email } = request.body;

  try {
    const modifyUser = await pool.query('UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *', [name, email, id]);
    if (modifyUser.rows.length > 0) {
      return response.status(200).send(`User modified with ID: ${id}`);
    }
    return response.status(400).send(`User with ID: ${id} does not exist`);
  } catch (err) {
    return response.status(400).send('Error updating a user');
  }
};

const deleteUser = async (request, response) => {
  const id = parseInt(request.params.id, 10);

  try {
    const delUser = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (delUser.rows.length === 0) {
      return response.status(400).send(`User with ID: ${id} does not exist`);
    }
    return response.status(200).send(`User deleted with ID: ${id}`);
  } catch (err) {
    return response.status(400).send('Error deleting a user');
  }
};

module.exports = {
  pool,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
