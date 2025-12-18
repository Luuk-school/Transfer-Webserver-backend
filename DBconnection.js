require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

// Productie pool       TransferDB
const poolProd = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test pool      Vite_test
const poolTest = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME_TEST,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Functie om verbinding te testen
const testConnection = async (pool, name) => {
  try {
    const [rows] = await pool.query('SHOW DATABASES');
    console.log(`${name} connection OK:`, rows.map(r => r.Database));
  } catch (err) {
    console.error(`${name} connection failed:`, err);
  }
};

const testTables = async (pool, name) => {
  try {
    const [rows] = await pool.query('SHOW TABLES');
    console.log(`${name} tables:`, rows);
  } catch (err) {
    console.error(`${name} table query failed:`, err);
  }
};


// Test beide pools
testConnection(poolProd, 'Prod');
testTables(poolProd, 'Prod');
testTables(poolTest, 'Test');



// Login endpoint (MVP: enkel username check)
app.post('/api/login', async (req, res) => {
  const { username } = req.body;
  console.log(`[/api/login] Processing login for: ${username}`);

  if (!username) {
    console.log(`[/api/login] Missing username`);
    return res.status(400).json({ error: 'Username required' });
  }

  try {
    console.log(`[/api/login] Querying database...`);
    const [rows] = await poolTest.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (rows.length > 0) {
      console.log(`[/api/login] User found`);
      res.json({ success: true, message: 'User found' });
    } else {
      console.log(`[/api/login] User not found`);
      res.json({ success: false, message: 'User not found' });
    }
  } catch (err) {
    console.error(`[/api/login] Database error:`, err.message);
    res.status(500).json({ error: 'Database error' });
  }
});
//signup endpoint (MVP:)

const bcrypt = require('bcrypt');

app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  console.log(`[/api/signup] Processing signup for: ${username}`);

  if (!username || !password) {
    console.log(`[/api/signup] Missing username or password`);
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    // Check of de username al bestaat
    console.log(`[/api/signup] Checking if username exists...`);
    const [existing] = await poolTest.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      console.log(`[/api/signup] Username already exists`);
      return res.json({ success: false, message: 'Username already exists' });
    }

    // Hash het wachtwoord
    console.log(`[/api/signup] Hashing password...`);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Voeg de nieuwe user toe met hashed wachtwoord
    console.log(`[/api/signup] Inserting new user...`);
    await poolTest.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );

    console.log(`[/api/signup] User created successfully`);
    res.json({ success: true, message: 'User created' });
  } catch (err) {
    console.error(`[/api/signup] Database error:`, err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Start server op poort 5000
app.listen(5000, () => {
  console.log('Server running on port 5000');
});

// voeg later een debug file toe zodat x true moet zijn om te deubggen
